import React, { useState, useRef } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    TextInput,
    Dimensions,
    Image,
    Platform,
    KeyboardAvoidingView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/Ionicons';
import FAIcon from '@expo/vector-icons/FontAwesome5';
import { Colors, Spacing, Fonts } from '../theme';
import BrandText from '../components/BrandText';
import BackgroundWrapper from '../components/BackgroundWrapper';
import { takePhoto, pickImage, showUploadOptions, UploadedFile, startAudioRecording, playAudio, stopAudio, uriToBase64 } from '../utils/uploadHelpers';

import { getCurrentLocation, watchLocation } from '../utils/locationHelpers';
import { scale, verticalScale, rf, wp, hp } from '../utils/responsiveHelpers';
import { useTasks } from '../hooks/useTasks';

interface TaskInProgressScreenProps {
    task: any;
    onBack: () => void;
    onComplete: (duration: string | number) => void;
    onDashboard: () => void;
    onLogExpenses: () => void;
    onProfile: () => void;
    onCalendar: () => void;
}

type Tab = 'Details' | 'Expenses' | 'Chatter';

const TaskInProgressScreen: React.FC<TaskInProgressScreenProps> = ({ task, onBack, onComplete, onDashboard, onLogExpenses, onProfile, onCalendar }) => {
    const [activeTab, setActiveTab] = useState<Tab>('Details');
    const [timer, setTimer] = useState('00:00:00');
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingSession, setRecordingSession] = useState<{ stop: () => Promise<UploadedFile | null> } | null>(null);
    const [playingFileUri, setPlayingFileUri] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [messageText, setMessageText] = useState('');
    const [isCompleting, setIsCompleting] = useState(false);
    const scrollRef = useRef<ScrollView>(null);

    // Mock task coordinates (sector 12, Karachi roughly)
    const taskCoords = {
        latitude: 24.9462,
        longitude: 67.0050,
    };

    React.useEffect(() => {
        const interval = setInterval(() => {
            if (task?.startedAt) {
                const start = new Date(task.startedAt).getTime();
                const now = new Date().getTime();
                const diff = Math.floor((now - start) / 1000);

                if (diff >= 0) {
                    const hours = Math.floor(diff / 3600);
                    const minutes = Math.floor((diff % 3600) / 60);
                    const seconds = diff % 60;

                    const formatted = [
                        hours.toString().padStart(2, '0'),
                        minutes.toString().padStart(2, '0'),
                        seconds.toString().padStart(2, '0')
                    ].join(':');

                    setTimer(formatted);
                }
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [task?.startedAt]);

    React.useEffect(() => {
        let unsubscribe: (() => void) | undefined;
        try {
            unsubscribe = watchLocation(
                (location) => {
                    setUserLocation(location);
                },
                (error) => {
                    console.warn('Location error:', error);
                }
            );
        } catch (err) {
            console.error('Failed to start location watch:', err);
        }

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    const handleCameraUpload = async () => {
        const file = await takePhoto();
        if (file) {
            setUploadedFiles(prev => [...prev, { ...file, timestamp: Date.now() }]);
            try {
                const base64 = await uriToBase64(file.uri);
                await logExpense(task.id, 'Image uploaded from mobile', base64);
            } catch (err) {
                console.error('Failed to log image expense:', err);
            }
        }
    };

    const handleGalleryUpload = async () => {
        const file = await pickImage();
        if (file) {
            setUploadedFiles(prev => [...prev, { ...file, timestamp: Date.now() }]);
            try {
                const base64 = await uriToBase64(file.uri);
                await logExpense(task.id, 'Gallery image uploaded from mobile', base64);
            } catch (err) {
                console.error('Failed to log gallery image expense:', err);
            }
        }
    };

    const handleUploadPress = () => {
        showUploadOptions(handleCameraUpload, handleGalleryUpload);
    };

    const handleVoicePress = async () => {
        if (isRecording && recordingSession) {
            const file = await recordingSession.stop();
            if (file) {
                setUploadedFiles(prev => [...prev, { ...file, timestamp: Date.now() }]);
            }
            setIsRecording(false);
            setRecordingSession(null);
        } else {
            const session = await startAudioRecording(
                () => setIsRecording(true),
                (error) => {
                    console.error('Recording error:', error);
                    setIsRecording(false);
                }
            );
            if (session) {
                setRecordingSession(session);
            }
        }
    };

    const { logExpense } = useTasks();

    const handleSendMessage = async () => {
        if (isRecording && recordingSession) {
            const file = await recordingSession.stop();
            if (file) {
                setUploadedFiles(prev => [...prev, { ...file, timestamp: Date.now() }]);
            }
            setIsRecording(false);
            setRecordingSession(null);
        } else if (messageText.trim()) {
            try {
                // Post to Odoo via logExpense
                await logExpense(task.id, messageText.trim());

                const textFile: UploadedFile = {
                    uri: '',
                    type: 'text/plain',
                    name: messageText.trim(),
                    timestamp: Date.now()
                };
                setUploadedFiles(prev => [...prev, textFile]);
                setMessageText('');
            } catch (error) {
                console.error('Failed to send message:', error);
            }
        }
    };

    const formatMessageTime = (timestamp?: number) => {
        if (!timestamp) return 'Just now';
        const now = Date.now();
        const diffInSeconds = Math.floor((now - timestamp) / 1000);

        if (diffInSeconds < 60) {
            return 'Just now';
        }

        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handlePlayAudio = (file: UploadedFile) => {
        if (playingFileUri === file.uri) {
            // Stop playing
            stopAudio();
            setPlayingFileUri(null);
        } else {
            // Start playing
            const { stop } = playAudio(
                file.uri,
                () => setPlayingFileUri(file.uri),
                () => setPlayingFileUri(null),
                (error) => {
                    console.error('Playback error:', error);
                    setPlayingFileUri(null);
                }
            );
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Details':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.infoGrid}>
                            <View style={styles.detailRow}>
                                <BrandText style={styles.detailLabel}>Due Date:</BrandText>
                                <BrandText style={styles.detailValue}>Apr 25, 2024</BrandText>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.detailRow}>
                                <BrandText style={styles.detailLabel}>Priority:</BrandText>
                                <View style={styles.priorityBadge}>
                                    <Icon name="alert-circle" size={scale(14)} color={Colors.heritageGold} />
                                    <BrandText style={styles.priorityText}>High Priority</BrandText>
                                </View>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.detailRow}>
                                <BrandText style={styles.detailLabel}>Status:</BrandText>
                                <BrandText style={styles.detailValue}>In Progress</BrandText>
                            </View>
                        </View>

                        <View style={styles.coordsCard}>
                            <View style={styles.coordsHeader}>
                                <Icon name="location-outline" size={scale(18)} color={Colors.heritageGold} />
                                <BrandText style={styles.coordsTitle}>Live GPS Coordinates</BrandText>
                            </View>
                            <View style={styles.coordsGrid}>
                                <View style={styles.coordBox}>
                                    <BrandText style={styles.coordLabel}>Latitude</BrandText>
                                    <BrandText style={styles.coordValue}>
                                        {userLocation ? userLocation.latitude.toFixed(6) : '--.------'}
                                    </BrandText>
                                </View>
                                <View style={styles.coordDivider} />
                                <View style={styles.coordBox}>
                                    <BrandText style={styles.coordLabel}>Longitude</BrandText>
                                    <BrandText style={styles.coordValue}>
                                        {userLocation ? userLocation.longitude.toFixed(6) : '--.------'}
                                    </BrandText>
                                </View>
                            </View>
                            {!userLocation && (
                                <BrandText style={styles.coordStatus}>Waiting for GPS signal...</BrandText>
                            )}
                        </View>

                        <View style={styles.taskInfoSection}>
                            <BrandText variant="headline" style={styles.sectionTitle}>Task Information</BrandText>
                            <View style={styles.bulletItem}>
                                <Icon name="ellipse" size={scale(6)} color={Colors.white} style={styles.bulletIcon} />
                                <BrandText style={styles.bulletText}>Perform maintenance on AC unit</BrandText>
                            </View>
                            <View style={styles.bulletItem}>
                                <Icon name="ellipse" size={scale(6)} color={Colors.white} style={styles.bulletIcon} />
                                <BrandText style={styles.bulletText}>Materials: Refrigerant, Pressure Gauge</BrandText>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.logExpenseInnerButton} onPress={() => setActiveTab('Expenses')}>
                            <BrandText style={styles.logExpenseText}>Log Expense</BrandText>
                        </TouchableOpacity>
                    </View>
                );
            case 'Expenses':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.expenseCard}>
                            <BrandText style={styles.placeholderText}>Record your job-related expenses here. Capture receipts for Odoo reconciliation.</BrandText>
                            <TouchableOpacity style={styles.addExpenseButton} onPress={onLogExpenses}>
                                <Icon name="add-circle-outline" size={scale(24)} color={Colors.white} />
                                <BrandText style={styles.addExpenseText}>Add New Expense</BrandText>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            case 'Chatter':
                return (
                    <View style={styles.tabContent}>
                        <View style={styles.chatList}>
                            {/* Sample Message */}
                            <View style={styles.chatMessage}>
                                <View style={styles.chatHeader}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <View style={styles.avatarMini}>
                                            <Icon name="person" size={scale(12)} color="#666" />
                                        </View>
                                        <BrandText style={styles.chatUser}>Sean Doherty</BrandText>
                                    </View>
                                    <BrandText style={styles.chatTime}>9:22 AM</BrandText>
                                </View>
                                <BrandText style={styles.chatText}>
                                    Please make sure you check both the indoor and outdoor units. Let me know if you need any additional equipment.
                                </BrandText>
                            </View>

                            {/* Show uploaded files */}
                            {
                                uploadedFiles.map((file, index) => (
                                    <View key={index} style={styles.chatMessageSent}>
                                        <View style={styles.chatHeader}>
                                            <BrandText style={styles.chatTime}>{formatMessageTime(file.timestamp)}</BrandText>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <BrandText style={styles.chatUser}>You</BrandText>
                                                <View style={[styles.avatarMini, { marginRight: 0, marginLeft: scale(8) }]}>
                                                    <Icon name="person" size={scale(12)} color="#666" />
                                                </View>
                                            </View>
                                        </View>
                                        {file.type.startsWith('image') ? (
                                            <View style={styles.imageAttachment}>
                                                <Image
                                                    source={{ uri: file.uri }}
                                                    style={styles.uploadedImage}
                                                    resizeMode="cover"
                                                />
                                                <BrandText style={styles.imageCaption}>{file.name}</BrandText>
                                            </View>
                                        ) : file.type.startsWith('audio') ? (
                                            <TouchableOpacity
                                                style={[
                                                    styles.fileAttachment,
                                                    styles.audioAttachment,
                                                    playingFileUri === file.uri && styles.playingAudio
                                                ]}
                                                onPress={() => handlePlayAudio(file)}
                                            >
                                                <Icon
                                                    name={playingFileUri === file.uri ? 'stop-circle' : 'play-circle'}
                                                    size={scale(24)}
                                                    color={playingFileUri === file.uri ? '#fff' : Colors.heritageGold}
                                                />
                                                <BrandText style={[
                                                    styles.fileName,
                                                    playingFileUri === file.uri && styles.playingFileName
                                                ]}>
                                                    {playingFileUri === file.uri ? 'Playing...' : file.name}
                                                </BrandText>
                                            </TouchableOpacity>
                                        ) : (
                                            <BrandText style={styles.chatText}>{file.name}</BrandText>
                                        )}
                                    </View>
                                ))
                            }
                        </View>
                    </View>
                );
        }
    };

    const handleComplete = () => {
        Alert.alert(
            'Finish Task',
            'Are you sure you want to complete this task and log your time?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Complete',
                    onPress: async () => {
                        setIsCompleting(true);
                        try {
                            if (task?.startedAt) {
                                // Send the timer string directly (HH:MM:SS)
                                console.log(`Completing task ${task.id}. Duration: ${timer}`);
                                await onComplete(timer);
                            } else {
                                await onComplete('00:00:00');
                            }
                        } catch (err) {
                            console.error('Completion error:', err);
                        } finally {
                            setIsCompleting(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <BackgroundWrapper>
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

                {/* Header - Moved outside KeyboardAvoidingView to stay fixed */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Icon name="chevron-back" size={scale(24)} color={Colors.white} />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <BrandText variant="headline" style={styles.headerTitle}>TASK DETAIL</BrandText>
                        <BrandText variant="headline" style={styles.headerDot}>•</BrandText>
                        <BrandText variant="headline" style={styles.targetStatus}>IN PROGRESS</BrandText>
                    </View>
                    <View style={styles.backButton} />
                </View>

                <KeyboardAvoidingView
                    behavior="padding"
                    style={{ flex: 1 }}
                    keyboardVerticalOffset={0}
                >

                    {/* Main Content Area */}
                    <ScrollView
                        ref={scrollRef}
                        style={styles.scrollArea}
                        keyboardShouldPersistTaps="handled"
                        onContentSizeChange={() => activeTab === 'Chatter' && scrollRef.current?.scrollToEnd({ animated: true })}
                        contentContainerStyle={styles.scrollContent}
                    >
                        {/* Task Context moved inside scrollable area if screens are small */}
                        <View style={styles.contextHeader}>
                            <BrandText variant="headline" style={styles.mainTitle}>{task?.title || 'Repair AC Unit'}</BrandText>
                            <View style={styles.userSummaryRow}>
                                <View style={styles.userAvatar}>
                                    <Icon name="person" size={scale(20)} color="#666" />
                                </View>
                                <View>
                                    <BrandText style={styles.userNameText}>{task?.company || 'Sarah Williamson'}</BrandText>
                                    <View style={styles.locationSmallRow}>
                                        <Icon name="location-outline" size={scale(12)} color={Colors.heritageGold} />
                                        <BrandText style={styles.locationSmallText}>{task?.location || '123 Pine St, Springfield'}</BrandText>
                                    </View>
                                </View>
                            </View>

                            {/* Navigation Tabs */}
                            <View style={styles.tabContainer}>
                                {(['Details', 'Expenses', 'Chatter'] as Tab[]).map((tab) => (
                                    <TouchableOpacity
                                        key={tab}
                                        style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
                                        onPress={() => setActiveTab(tab)}
                                    >
                                        <BrandText style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                                            {tab}
                                        </BrandText>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {renderTabContent()}
                    </ScrollView>

                    {/* Chat Input moved OUTSIDE ScrollView for standard keyboard handling */}
                    {activeTab === 'Chatter' && (
                        <View style={styles.chatInputContainer}>
                            <View style={styles.chatInputWrapper}>
                                <TouchableOpacity style={styles.chatIconBtn} onPress={handleUploadPress}>
                                    <Icon name="camera-outline" size={scale(22)} color="rgba(255,255,255,0.6)" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.chatIconBtn, isRecording && styles.recordingActive]}
                                    onPress={handleVoicePress}
                                >
                                    <Icon
                                        name={isRecording ? "stop-circle" : "mic-outline"}
                                        size={scale(22)}
                                        color={isRecording ? Colors.heritageGold : "rgba(255,255,255,0.6)"}
                                    />
                                </TouchableOpacity>
                                <TextInput
                                    style={styles.chatInputField}
                                    placeholder={isRecording ? "Recording..." : "Write a message..."}
                                    placeholderTextColor={isRecording ? Colors.heritageGold : "rgba(255,255,255,0.4)"}
                                    editable={!isRecording}
                                    value={messageText}
                                    onChangeText={setMessageText}
                                    multiline
                                    cursorColor={Colors.heritageGold}
                                    selectionColor={Colors.heritageGold}
                                />
                                <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                                    <Icon name="send" size={scale(20)} color={Colors.heritageGold} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}



                    {/* Persistent Footer Timer & Completion - Hidden in Chatter for extra space */}
                    {activeTab !== 'Chatter' && (
                        <View style={styles.persistentFooter}>
                            <View style={styles.timerContentRow}>
                                <Icon name="time-outline" size={scale(20)} color={Colors.white} />
                                <BrandText style={styles.timerDisplayText}>{timer} In Progress</BrandText>
                            </View>
                            <TouchableOpacity
                                style={[styles.finalCompleteBtn, isCompleting && { opacity: 0.7 }]}
                                onPress={handleComplete}
                                disabled={isCompleting}
                            >
                                {isCompleting ? (
                                    <ActivityIndicator color={Colors.white} size="small" />
                                ) : (
                                    <BrandText style={styles.finalCompleteText}>COMPLETE TASK</BrandText>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Bottom Nav */}
                    {activeTab !== 'Chatter' && (
                        <View style={styles.footerNav}>
                            <TouchableOpacity style={styles.navLink} onPress={onDashboard}>
                                <Icon name="home-outline" size={scale(24)} color={Colors.white} />
                                <BrandText style={styles.navLabel}>Dashboard</BrandText>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.navLink}>
                                <FAIcon name="file-alt" size={scale(22)} color={Colors.heritageGold} />
                                <BrandText style={[styles.navLabel, styles.activeLabel]}>Tasks</BrandText>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.navLink} onPress={onCalendar}>
                                <Icon name="calendar-outline" size={scale(24)} color={Colors.white} />
                                <BrandText style={styles.navLabel}>Calendar</BrandText>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.navLink} onPress={onProfile}>
                                <Icon name="settings-outline" size={scale(24)} color={Colors.white} />
                                <BrandText style={styles.navLabel}>Settings</BrandText>
                            </TouchableOpacity>
                        </View>
                    )}
                </KeyboardAvoidingView>
            </SafeAreaView>
        </BackgroundWrapper >
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    header: {
        height: verticalScale(55),
        paddingTop: verticalScale(10),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(5),
    },
    backButton: {
        width: scale(40),
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: rf(16),
        fontWeight: 'bold',
        letterSpacing: 1,
        color: 'rgba(255,255,255,0.7)',
    },
    headerDot: {
        fontSize: rf(16),
        marginHorizontal: scale(8),
        color: Colors.heritageGold,
    },
    targetStatus: {
        fontSize: rf(16),
        fontWeight: 'bold',
        letterSpacing: 1,
        color: Colors.heritageGold,
    },
    contextHeader: {
        paddingHorizontal: wp(6),
        paddingTop: verticalScale(4),
    },
    mainTitle: {
        fontSize: rf(24),
        fontWeight: 'bold',
        marginBottom: verticalScale(12),
    },
    userSummaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(20),
    },
    userAvatar: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(12),
        borderWidth: 1,
        borderColor: Colors.divider,
    },
    userNameText: {
        fontSize: rf(16),
        fontWeight: 'bold',
    },
    locationSmallRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: verticalScale(2),
    },
    locationSmallText: {
        fontSize: rf(12),
        opacity: 0.6,
        marginLeft: scale(4),
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: scale(12),
        padding: scale(4),
        marginBottom: verticalScale(8),
    },
    tabItem: {
        flex: 1,
        paddingVertical: verticalScale(10),
        alignItems: 'center',
        borderRadius: scale(8),
    },
    tabItemActive: {
        backgroundColor: Colors.heritageGold,
    },
    tabText: {
        fontSize: rf(14),
        opacity: 0.6,
        fontWeight: '500',
    },
    tabTextActive: {
        opacity: 1,
        color: Colors.white,
        fontWeight: 'bold',
    },
    scrollArea: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: verticalScale(20),
    },
    tabContent: {
        padding: wp(6),
    },
    infoGrid: {
        backgroundColor: Colors.cardBackground,
        borderRadius: scale(16),
        padding: scale(16),
        borderWidth: 1,
        borderColor: Colors.divider,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: verticalScale(12),
    },
    detailLabel: {
        fontSize: rf(14),
        opacity: 0.6,
    },
    detailValue: {
        fontSize: rf(14),
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: Colors.divider,
    },
    priorityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(232, 131, 47, 0.1)',
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(4),
        borderRadius: scale(4),
    },
    priorityText: {
        color: Colors.heritageGold,
        fontSize: rf(12),
        fontWeight: 'bold',
        marginLeft: scale(6),
    },
    taskInfoSection: {
        marginTop: verticalScale(24),
    },
    sectionTitle: {
        fontSize: rf(18),
        fontWeight: 'bold',
        marginBottom: verticalScale(16),
    },
    bulletItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    bulletIcon: {
        marginRight: scale(12),
        opacity: 0.5,
    },
    bulletText: {
        fontSize: rf(14),
        opacity: 0.8,
    },
    logExpenseInnerButton: {
        backgroundColor: Colors.heritageGold,
        height: verticalScale(50),
        borderRadius: scale(12),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: verticalScale(32),
    },
    logExpenseText: {
        fontWeight: 'bold',
        fontSize: rf(16),
    },
    expenseCard: {
        backgroundColor: Colors.cardBackground,
        padding: scale(24),
        borderRadius: scale(16),
        borderWidth: 1,
        borderColor: Colors.divider,
        alignItems: 'center',
    },
    placeholderText: {
        textAlign: 'center',
        opacity: 0.5,
        lineHeight: rf(20),
        marginBottom: verticalScale(24),
    },
    addExpenseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: scale(20),
        paddingVertical: verticalScale(12),
        borderRadius: scale(12),
        borderWidth: 1,
        borderColor: Colors.divider,
    },
    addExpenseText: {
        fontWeight: 'bold',
        marginLeft: scale(10),
    },
    chatList: {
        gap: verticalScale(20),
    },
    chatMessage: {
        alignSelf: 'flex-start',
        maxWidth: '85%',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: scale(14),
        borderTopLeftRadius: scale(4),
        borderTopRightRadius: scale(20),
        borderBottomLeftRadius: scale(20),
        borderBottomRightRadius: scale(20),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        marginBottom: verticalScale(12),
    },
    chatMessageSent: {
        alignSelf: 'flex-end',
        maxWidth: '85%',
        backgroundColor: 'rgba(232, 131, 47, 0.12)',
        padding: scale(14),
        borderTopLeftRadius: scale(20),
        borderTopRightRadius: scale(4),
        borderBottomLeftRadius: scale(20),
        borderBottomRightRadius: scale(20),
        borderWidth: 1,
        borderColor: 'rgba(232, 131, 47, 0.2)',
        marginBottom: verticalScale(12),
    },
    chatHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(8),
        justifyContent: 'space-between',
    },
    avatarMini: {
        width: scale(22),
        height: scale(22),
        borderRadius: scale(11),
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(8),
    },
    chatUser: {
        fontSize: rf(11),
        fontWeight: 'bold',
        color: Colors.heritageGold,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    chatTime: {
        fontSize: rf(10),
        color: 'rgba(255,255,255,0.4)',
    },
    chatText: {
        fontSize: rf(14),
        lineHeight: rf(20),
        color: '#E0E0E0',
    },
    fileAttachment: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: scale(8),
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: scale(8),
    },
    fileName: {
        fontSize: rf(12),
        marginLeft: scale(8),
    },
    chatInputContainer: {
        paddingHorizontal: wp(4),
        paddingBottom: Platform.OS === 'ios' ? verticalScale(20) : verticalScale(6),
        paddingTop: verticalScale(6),
        backgroundColor: 'transparent',
    },
    chatInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: scale(5),
        paddingHorizontal: scale(12),
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: scale(24),
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    chatIconBtn: {
        padding: scale(6),
        marginRight: scale(4),
    },
    recordingActive: {
        backgroundColor: 'rgba(232, 131, 47, 0.2)',
        borderRadius: scale(12),
    },
    chatInputField: {
        flex: 1,
        color: Colors.white,
        fontSize: rf(14),
        paddingVertical: verticalScale(8),
        paddingHorizontal: scale(8),
        maxHeight: verticalScale(100),
        textAlignVertical: 'center',
    },
    sendButton: {
        padding: scale(8),
        marginLeft: scale(4),
    },
    persistentFooter: {
        paddingHorizontal: wp(6),
        paddingVertical: verticalScale(16),
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderTopWidth: 1,
        borderTopColor: Colors.divider,
    },
    timerContentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: verticalScale(10),
    },
    timerDisplayText: {
        fontSize: rf(18),
        fontWeight: 'bold',
        marginLeft: scale(10),
        letterSpacing: 0.5,
    },
    finalCompleteBtn: {
        backgroundColor: Colors.heritageGold,
        height: verticalScale(48),
        borderRadius: scale(12),
        justifyContent: 'center',
        alignItems: 'center',
    },
    finalCompleteText: {
        fontWeight: 'bold',
        fontSize: rf(16),
        letterSpacing: 1,
    },
    footerNav: {
        height: verticalScale(70),
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 35, 28, 0.95)',
        borderTopWidth: 1,
        borderColor: Colors.divider,
        paddingBottom: verticalScale(10),
    },
    navLink: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    navLabel: {
        fontSize: rf(10),
        marginTop: verticalScale(4),
        opacity: 0.6,
    },
    activeLabel: {
        color: Colors.heritageGold,
        fontWeight: 'bold',
        opacity: 1,
    },
    imageAttachment: {
        borderRadius: scale(12),
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    uploadedImage: {
        width: scale(200),
        height: verticalScale(150),
        borderRadius: scale(8),
    },
    imageCaption: {
        fontSize: rf(11),
        color: 'rgba(255,255,255,0.6)',
        marginTop: verticalScale(6),
        paddingHorizontal: scale(4),
        paddingBottom: scale(4),
    },
    audioAttachment: {
        paddingVertical: verticalScale(12),
        paddingHorizontal: scale(16),
        borderRadius: scale(12),
        borderWidth: 1,
        borderColor: Colors.heritageGold,
    },
    playingAudio: {
        backgroundColor: Colors.heritageGold,
    },
    playingFileName: {
        color: '#fff',
    },
    coordsCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: scale(16),
        padding: scale(20),
        marginTop: verticalScale(24),
        borderWidth: 1,
        borderColor: Colors.divider,
    },
    coordsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(16),
    },
    coordsTitle: {
        fontSize: rf(16),
        fontWeight: 'bold',
        marginLeft: scale(8),
        color: Colors.white,
    },
    coordsGrid: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    coordBox: {
        flex: 1,
        alignItems: 'center',
    },
    coordLabel: {
        fontSize: rf(12),
        color: 'rgba(255, 255, 255, 0.5)',
        marginBottom: verticalScale(4),
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    coordValue: {
        fontSize: rf(18),
        fontWeight: 'bold',
        color: Colors.heritageGold,
        fontFamily: 'monospace',
    },
    coordDivider: {
        width: 1,
        height: verticalScale(40),
        backgroundColor: Colors.divider,
        marginHorizontal: scale(10),
    },
    coordStatus: {
        fontSize: rf(12),
        color: 'rgba(255, 255, 255, 0.4)',
        textAlign: 'center',
        marginTop: verticalScale(12),
        fontStyle: 'italic',
    },
});

export default TaskInProgressScreen;
