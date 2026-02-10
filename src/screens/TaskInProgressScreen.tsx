import React, { useState, useRef } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    TextInput,
    Dimensions,
    SafeAreaView,
    Image,
    Platform,
    KeyboardAvoidingView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FAIcon from 'react-native-vector-icons/FontAwesome5';
import { Colors, Spacing, Fonts } from '../theme';
import BrandText from '../components/BrandText';
import BackgroundWrapper from '../components/BackgroundWrapper';
import { takePhoto, pickImage, showUploadOptions, UploadedFile, startAudioRecording, playAudio, stopAudio } from '../utils/uploadHelpers';

import { getCurrentLocation, watchLocation } from '../utils/locationHelpers';

const { width } = Dimensions.get('window');

interface TaskInProgressScreenProps {
    task: any;
    onBack: () => void;
    onComplete: () => void;
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
        }
    };

    const handleGalleryUpload = async () => {
        const file = await pickImage();
        if (file) {
            setUploadedFiles(prev => [...prev, { ...file, timestamp: Date.now() }]);
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

    const handleSendMessage = async () => {
        if (isRecording && recordingSession) {
            const file = await recordingSession.stop();
            if (file) {
                setUploadedFiles(prev => [...prev, { ...file, timestamp: Date.now() }]);
            }
            setIsRecording(false);
            setRecordingSession(null);
        } else if (messageText.trim()) {
            const textFile: UploadedFile = {
                uri: '',
                type: 'text/plain',
                name: messageText.trim(),
                timestamp: Date.now()
            };
            setUploadedFiles(prev => [...prev, textFile]);
            setMessageText('');
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
                                    <Icon name="alert-circle" size={14} color={Colors.heritageGold} />
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
                                <Icon name="location-outline" size={18} color={Colors.heritageGold} />
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
                                <Icon name="ellipse" size={6} color={Colors.white} style={styles.bulletIcon} />
                                <BrandText style={styles.bulletText}>Perform maintenance on AC unit</BrandText>
                            </View>
                            <View style={styles.bulletItem}>
                                <Icon name="ellipse" size={6} color={Colors.white} style={styles.bulletIcon} />
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
                                <Icon name="add-circle-outline" size={24} color={Colors.white} />
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
                                            <Icon name="person" size={12} color="#666" />
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
                                                <View style={[styles.avatarMini, { marginRight: 0, marginLeft: 8 }]}>
                                                    <Icon name="person" size={12} color="#666" />
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
                                                    size={24}
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

    return (
        <BackgroundWrapper>
            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ flex: 1 }}
                >
                    <StatusBar barStyle="light-content" />

                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onBack} style={styles.backButton}>
                            <Icon name="chevron-back" size={24} color={Colors.white} />
                        </TouchableOpacity>
                        <View style={styles.headerTitleContainer}>
                            <BrandText variant="headline" style={styles.headerTitle}>TASK DETAIL</BrandText>
                            <BrandText variant="headline" style={styles.headerDot}>•</BrandText>
                            <BrandText variant="headline" style={styles.targetStatus}>IN PROGRESS</BrandText>
                        </View>
                        <View style={styles.backButton} />
                    </View>

                    {/* Task Context Header */}
                    <View style={styles.contextHeader}>
                        <BrandText variant="headline" style={styles.mainTitle}>Repair AC Unit</BrandText>
                        <View style={styles.userSummaryRow}>
                            <View style={styles.userAvatar}>
                                <Icon name="person" size={20} color="#666" />
                            </View>
                            <View>
                                <BrandText style={styles.userNameText}>Sarah Williamson</BrandText>
                                <View style={styles.locationSmallRow}>
                                    <Icon name="location-outline" size={12} color={Colors.heritageGold} />
                                    <BrandText style={styles.locationSmallText}>123 Pine St, Springfield</BrandText>
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

                    <ScrollView ref={scrollRef} style={styles.scrollArea}>
                        {renderTabContent()}
                    </ScrollView>

                    {/* pinned Chat Input when in Chatter tab - Pinned to bottom above footer */}
                    {activeTab === 'Chatter' && (
                        <View style={[styles.chatInputWrapper, { marginHorizontal: Spacing.l, marginBottom: 16 }]}>
                            <TouchableOpacity style={styles.chatIconBtn} onPress={handleUploadPress}>
                                <Icon name="camera-outline" size={22} color="rgba(255,255,255,0.6)" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.chatIconBtn, isRecording && styles.recordingActive]}
                                onPress={handleVoicePress}
                            >
                                <Icon
                                    name={isRecording ? "stop-circle" : "mic-outline"}
                                    size={22}
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
                            />
                            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                                <Icon name="send" size={20} color={Colors.heritageGold} />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Persistent Footer Timer & Completion */}
                    <View style={styles.persistentFooter}>
                        <View style={styles.timerContentRow}>
                            <Icon name="time-outline" size={20} color={Colors.white} />
                            <BrandText style={styles.timerDisplayText}>{timer} In Progress</BrandText>
                        </View>
                        <TouchableOpacity style={styles.finalCompleteBtn} onPress={onComplete}>
                            <BrandText style={styles.finalCompleteText}>COMPLETE TASK</BrandText>
                        </TouchableOpacity>
                    </View>

                    {/* Bottom Nav */}
                    {activeTab !== 'Chatter' && (
                        <View style={styles.footerNav}>
                            <TouchableOpacity style={styles.navLink} onPress={onDashboard}>
                                <Icon name="home-outline" size={24} color={Colors.white} />
                                <BrandText style={styles.navLabel}>Dashboard</BrandText>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.navLink}>
                                <FAIcon name="file-alt" size={22} color={Colors.heritageGold} />
                                <BrandText style={[styles.navLabel, styles.activeLabel]}>Tasks</BrandText>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.navLink} onPress={onCalendar}>
                                <Icon name="calendar-outline" size={24} color={Colors.white} />
                                <BrandText style={styles.navLabel}>Calendar</BrandText>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.navLink} onPress={onProfile}>
                                <Icon name="settings-outline" size={24} color={Colors.white} />
                                <BrandText style={styles.navLabel}>Settings</BrandText>
                            </TouchableOpacity>
                        </View>
                    )}
                </KeyboardAvoidingView>
            </SafeAreaView>
        </BackgroundWrapper>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    header: {
        height: 100,
        paddingTop: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.m,
    },
    backButton: {
        width: 40,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1,
        color: 'rgba(255,255,255,0.7)',
    },
    headerDot: {
        fontSize: 14,
        marginHorizontal: 8,
        color: Colors.heritageGold,
    },
    targetStatus: {
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1,
        color: Colors.heritageGold,
    },
    contextHeader: {
        paddingHorizontal: Spacing.l,
        paddingTop: Spacing.s,
    },
    mainTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    userSummaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: Colors.divider,
    },
    userNameText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    locationSmallRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    locationSmallText: {
        fontSize: 12,
        opacity: 0.6,
        marginLeft: 4,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 12,
        padding: 4,
        marginBottom: 8,
    },
    tabItem: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    tabItemActive: {
        backgroundColor: Colors.heritageGold,
    },
    tabText: {
        fontSize: 14,
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
    tabContent: {
        padding: Spacing.l,
    },
    infoGrid: {
        backgroundColor: Colors.cardBackground,
        borderRadius: 16,
        padding: Spacing.m,
        borderWidth: 1,
        borderColor: Colors.divider,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    detailLabel: {
        fontSize: 14,
        opacity: 0.6,
    },
    detailValue: {
        fontSize: 14,
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
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    priorityText: {
        color: Colors.heritageGold,
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 6,
    },
    taskInfoSection: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    bulletItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    bulletIcon: {
        marginRight: 12,
        opacity: 0.5,
    },
    bulletText: {
        fontSize: 14,
        opacity: 0.8,
    },
    logExpenseInnerButton: {
        backgroundColor: Colors.heritageGold,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 32,
    },
    logExpenseText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    expenseCard: {
        backgroundColor: Colors.cardBackground,
        padding: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.divider,
        alignItems: 'center',
    },
    placeholderText: {
        textAlign: 'center',
        opacity: 0.5,
        lineHeight: 20,
        marginBottom: 24,
    },
    addExpenseButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.divider,
    },
    addExpenseText: {
        fontWeight: 'bold',
        marginLeft: 10,
    },
    chatList: {
        gap: 20,
    },
    chatMessage: {
        alignSelf: 'flex-start',
        maxWidth: '80%',
        backgroundColor: '#1A302B',
        padding: 14,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    chatMessageSent: {
        alignSelf: 'flex-end',
        maxWidth: '80%',
        backgroundColor: 'rgba(232, 131, 47, 0.15)',
        padding: 14,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 4,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(232, 131, 47, 0.2)',
    },
    chatHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        justifyContent: 'space-between',
    },
    avatarMini: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    chatUser: {
        fontSize: 11,
        fontWeight: 'bold',
        color: Colors.heritageGold,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    chatTime: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.4)',
    },
    chatText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#E0E0E0',
    },
    fileAttachment: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
    },
    fileName: {
        fontSize: 12,
        marginLeft: 8,
    },
    chatInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        backgroundColor: Colors.inputBackground,
        borderRadius: 16,
        marginTop: 20,
        borderWidth: 1,
        borderColor: Colors.divider,
    },
    chatIconBtn: {
        padding: 8,
    },
    recordingActive: {
        backgroundColor: 'rgba(232, 131, 47, 0.2)',
        borderRadius: 8,
    },
    chatInputField: {
        flex: 1,
        color: Colors.white,
        fontSize: 14,
        paddingHorizontal: 12,
    },
    sendButton: {
        padding: 8,
    },
    persistentFooter: {
        paddingHorizontal: Spacing.l,
        paddingVertical: Spacing.m,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderTopWidth: 1,
        borderTopColor: Colors.divider,
    },
    timerContentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    timerDisplayText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
        letterSpacing: 0.5,
    },
    finalCompleteBtn: {
        backgroundColor: Colors.heritageGold,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    finalCompleteText: {
        fontWeight: 'bold',
        fontSize: 16,
        letterSpacing: 1,
    },
    footerNav: {
        height: 80,
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 35, 28, 0.95)',
        borderTopWidth: 1,
        borderColor: Colors.divider,
        paddingBottom: 20,
    },
    navLink: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    navLabel: {
        fontSize: 10,
        marginTop: 4,
        opacity: 0.6,
    },
    activeLabel: {
        color: Colors.heritageGold,
        fontWeight: 'bold',
        opacity: 1,
    },
    imageAttachment: {
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    uploadedImage: {
        width: 200,
        height: 150,
        borderRadius: 8,
    },
    imageCaption: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 6,
        paddingHorizontal: 4,
        paddingBottom: 4,
    },
    audioAttachment: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
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
        borderRadius: 16,
        padding: 20,
        marginTop: 24,
        borderWidth: 1,
        borderColor: Colors.divider,
    },
    coordsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    coordsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
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
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.5)',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    coordValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.heritageGold,
        fontFamily: 'monospace',
    },
    coordDivider: {
        width: 1,
        height: 40,
        backgroundColor: Colors.divider,
        marginHorizontal: 10,
    },
    coordStatus: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.4)',
        textAlign: 'center',
        marginTop: 12,
        fontStyle: 'italic',
    },
});

export default TaskInProgressScreen;
