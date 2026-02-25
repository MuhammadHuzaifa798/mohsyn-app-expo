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
    RefreshControl,
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
import { showToast } from '../utils/toast';
import { ODOO_URL } from '../utils/odooApi';
import { stripHtml } from '../utils/textHelpers';

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

const TaskInProgressScreen: React.FC<TaskInProgressScreenProps> = ({ task: initialTask, onBack, onComplete, onDashboard, onLogExpenses, onProfile, onCalendar }) => {
    const { holdTask, startTask, getMessages, sendMessage, sendAudioMessage, logExpense, refreshTasks, tasks } = useTasks();

    // Always find the latest state of this task from our central context - Fix ID matching (type safety)
    const task = tasks.find(t => String(t.id) === String(initialTask.id)) || initialTask;

    const [activeTab, setActiveTab] = useState<Tab>('Details');
    const [timer, setTimer] = useState('00:00:00');
    const [secondsElapsed, setSecondsElapsed] = useState(0);
    const [isPaused, setIsPaused] = useState(task?.status === 'On Hold');
    const [isActionLoading, setIsActionLoading] = useState(false);

    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingSession, setRecordingSession] = useState<{ stop: () => Promise<UploadedFile | null> } | null>(null);
    const [playingFileUri, setPlayingFileUri] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [messageText, setMessageText] = useState('');
    const [isCompleting, setIsCompleting] = useState(false);
    const [pausedTime, setPausedTime] = useState<string | null>(null);
    // Chatter state
    const [messages, setMessages] = useState<any[]>([]);
    const [isMessagesLoading, setIsMessagesLoading] = useState(false);
    const scrollRef = useRef<ScrollView>(null);

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await refreshTasks();
        if (activeTab === 'Chatter') {
            await loadMessages();
        }
        setRefreshing(false);
    }, [activeTab, refreshTasks]);

    // Keep isPaused in sync with the live task status from context
    React.useEffect(() => {
        if (task) {
            setIsPaused(task.status === 'On Hold');
            // If the task updates and it's no longer paused, clear the local frozen time
            if (task.status !== 'On Hold') {
                setPausedTime(null);
            }
        }
    }, [task?.status]);

    // Fetch messages when tab changes to Chatter
    React.useEffect(() => {
        if (activeTab === 'Chatter') {
            loadMessages();
        }
    }, [activeTab]);

    const loadMessages = async () => {
        setIsMessagesLoading(true);
        const msgs = await getMessages(task.id);
        setMessages(msgs);
        setIsMessagesLoading(false);
    };

    React.useEffect(() => {
        let interval: NodeJS.Timeout;

        const updateTimer = () => {
            const accumulatedSeconds = (task?.effective_hours || 0) * 3600;
            let currentSessionSeconds = 0;

            if (!isPaused && task?.startedAt) {
                const start = new Date(task.startedAt).getTime();
                const now = new Date().getTime();
                currentSessionSeconds = Math.max(0, Math.floor((now - start) / 1000));
            }

            const totalSeconds = Math.floor(accumulatedSeconds + currentSessionSeconds);
            setSecondsElapsed(totalSeconds);

            // If we have a pausedTime set manually, use it instead to prevent jitter
            if (isPaused && pausedTime) {
                setTimer(pausedTime);
                return;
            }

            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            const formatted = [
                hours.toString().padStart(2, '0'),
                minutes.toString().padStart(2, '0'),
                seconds.toString().padStart(2, '0')
            ].join(':');

            setTimer(formatted);
        };

        // Initial update
        updateTimer();

        if (!isPaused && task?.startedAt) {
            interval = setInterval(updateTimer, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [task?.startedAt, task?.effective_hours, isPaused]);

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
            console.log('Failed to start location watch:', err);
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
                showToast.success('Success', 'Photo uploaded and logged');
            } catch (err: any) {
                console.log('Failed to log image expense:', err);
                showToast.error('Upload Failed', err.message || 'Could not log photo');
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
                showToast.success('Success', 'Image uploaded and logged');
            } catch (err: any) {
                console.log('Failed to log gallery image expense:', err);
                showToast.error('Upload Failed', err.message || 'Could not log image');
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
                await handleAudioUpload(file);
            }
            setIsRecording(false);
            setRecordingSession(null);
        } else {
            const session = await startAudioRecording(
                () => setIsRecording(true),
                (error) => {
                    console.log('Recording error:', error);
                    setIsRecording(false);
                }
            );
            if (session) {
                setRecordingSession(session);
            }
        }
    };

    const handleAudioUpload = async (file: UploadedFile) => {
        try {
            const base64 = await uriToBase64(file.uri);
            await sendAudioMessage(task.id, base64, file.name || 'voice_note.mp3');
            await loadMessages();
        } catch (error: any) {
            console.log('Failed to upload audio:', error);
            showToast.error('Upload Failed', error.message || 'Could not upload voice note');
        }
    };

    // logExpense destructuring removed as it's now in the top-level hook destructuring

    const handleSendMessage = async () => {
        if (isRecording && recordingSession) {
            const file = await recordingSession.stop();
            if (file) {
                setUploadedFiles(prev => [...prev, { ...file, timestamp: Date.now() }]);
                await handleAudioUpload(file);
            }
            setIsRecording(false);
            setRecordingSession(null);
        } else if (messageText.trim()) {
            try {
                // Post to Odoo via sendMessage API
                await sendMessage(task.id, messageText.trim());

                // Refresh messages
                await loadMessages();
                setMessageText('');
                // showToast.success('Message sent'); // Optional: can be noisy
            } catch (error: any) {
                console.log('Failed to send message:', error);
                showToast.error('Send Failed', error.message || 'Could not send message');
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
                    console.log('Playback error:', error);
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
                            <BrandText style={styles.bulletText}>
                                {task?.description || "Perform maintenance on AC unit. Materials: Refrigerant, Pressure Gauge."}
                            </BrandText>
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
                            {isMessagesLoading ? (
                                <ActivityIndicator size="small" color={Colors.heritageGold} />
                            ) : messages.length === 0 && uploadedFiles.length === 0 ? (
                                <BrandText style={{ textAlign: 'center', opacity: 0.5, marginTop: 20 }}>No messages yet</BrandText>
                            ) : (
                                <>
                                    {/* Render Messages from API */}
                                    {messages
                                        .filter(msg => !msg.body_text?.includes('message has been removed'))
                                        .map((msg) => {
                                            const bodyStr = msg.body_text || msg.body || '';
                                            // Simple HTML decode and strip
                                            const cleanedBody = stripHtml(bodyStr);

                                            const bodyLower = bodyStr.toLowerCase();
                                            const isLikelyVoice = bodyLower.includes('voice note') ||
                                                bodyLower.includes('audio') ||
                                                bodyLower.includes('recording') ||
                                                bodyLower.includes('voice_note') ||
                                                bodyLower.includes('.m4a') ||
                                                bodyLower.includes('.mp3');

                                            return (
                                                <View key={msg.id} style={msg.is_author ? styles.chatMessageSent : styles.chatMessage}>
                                                    <View style={styles.chatHeader}>
                                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                            {!msg.is_author && (
                                                                <View style={styles.avatarMini}>
                                                                    <Icon name="person" size={scale(12)} color="#666" />
                                                                </View>
                                                            )}
                                                            <BrandText style={styles.chatUser}>
                                                                {msg.is_author ? 'You' : msg.author_name}
                                                            </BrandText>
                                                        </View>
                                                        <BrandText style={styles.chatTime}>{formatMessageTime(new Date(msg.date).getTime())}</BrandText>
                                                    </View>

                                                    {/* Render Attachments from Server - support multiple possible field names from Odoo JSON */}
                                                    {(() => {
                                                        // Be extremely permissive with field names as Odoo can be inconsistent
                                                        let rawAtts = msg.attachments || msg.attachment_ids || msg.attachment_info || msg.message_attachments || [];

                                                        // If rawAtts is empty, try to recover attachment ID from the body HTML (Odoo often renders links there)
                                                        if ((!rawAtts || rawAtts.length === 0) && bodyStr.includes('/web/content/')) {
                                                            const match = bodyStr.match(/\/web\/content\/(\d+)/);
                                                            if (match && match[1]) {
                                                                rawAtts = [{ id: parseInt(match[1]), name: isLikelyVoice ? 'Voice Note.m4a' : 'Attachment' }];
                                                            }
                                                        }

                                                        if (rawAtts && Array.isArray(rawAtts) && rawAtts.length > 0) {
                                                            return rawAtts.map((att: any, idx: number) => {
                                                                const attId = typeof att === 'object' ? att.id : att;
                                                                const attName = typeof att === 'object' ? (att.name || att.filename) : (isLikelyVoice ? `Voice Note ${idx + 1}.m4a` : 'Attachment');
                                                                const attType = typeof att === 'object' ? (att.mimetype || att.content_type) : '';
                                                                const attUri = `${ODOO_URL}/web/content/${attId}?download=true`;

                                                                const isAudio = attType?.includes('audio') ||
                                                                    attName?.toLowerCase().match(/\.(m4a|mp3|wav|ogg|aac)$/) ||
                                                                    (isLikelyVoice && idx === 0);

                                                                const isImage = attType?.includes('image') ||
                                                                    attName?.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/);

                                                                if (isAudio) {
                                                                    return (
                                                                        <TouchableOpacity
                                                                            key={`att-${attId}-${idx}`}
                                                                            style={[
                                                                                styles.fileAttachment,
                                                                                styles.audioAttachment,
                                                                                playingFileUri === attUri && styles.playingAudio,
                                                                                { marginBottom: idx < rawAtts.length - 1 ? scale(8) : 0 }
                                                                            ]}
                                                                            onPress={() => handlePlayAudio({ uri: attUri, name: attName, type: attType || 'audio/m4a' } as any)}
                                                                        >
                                                                            <Icon
                                                                                name={playingFileUri === attUri ? 'stop-circle' : 'play-circle'}
                                                                                size={scale(24)}
                                                                                color={playingFileUri === attUri ? '#fff' : Colors.heritageGold}
                                                                            />
                                                                            <BrandText style={[
                                                                                styles.fileName,
                                                                                playingFileUri === attUri && styles.playingFileName
                                                                            ]}>
                                                                                {playingFileUri === attUri ? 'Playing...' : attName}
                                                                            </BrandText>
                                                                        </TouchableOpacity>
                                                                    );
                                                                } else if (isImage) {
                                                                    return (
                                                                        <View key={`att-${attId}-${idx}`} style={[styles.imageAttachment, { marginBottom: idx < rawAtts.length - 1 ? scale(8) : 0 }]}>
                                                                            <Image source={{ uri: attUri }} style={styles.uploadedImage} resizeMode="cover" />
                                                                            <BrandText style={styles.imageCaption}>{attName}</BrandText>
                                                                        </View>
                                                                    );
                                                                } else {
                                                                    return (
                                                                        <TouchableOpacity
                                                                            key={`att-${attId}-${idx}`}
                                                                            style={[styles.fileAttachment, { marginBottom: idx < rawAtts.length - 1 ? scale(8) : 0 }]}
                                                                        >
                                                                            <Icon name="document-attach" size={scale(20)} color={Colors.heritageGold} />
                                                                            <BrandText style={styles.fileName}>{attName}</BrandText>
                                                                        </TouchableOpacity>
                                                                    );
                                                                }
                                                            });
                                                        }

                                                        // If no attachments were found, show the cleaned body text
                                                        return <BrandText style={styles.chatText}>{cleanedBody || 'Message'}</BrandText>;
                                                    })()}

                                                    {/* Only show extra body text if we actually have attachments and it's not a voice note notification */}
                                                    {(msg.attachments?.length > 0 || msg.attachment_ids?.length > 0 || bodyStr.includes('/web/content/')) && bodyLower && !bodyLower.includes('voice note') && (
                                                        <BrandText style={[styles.chatText, { marginTop: scale(8) }]}>{cleanedBody}</BrandText>
                                                    )}
                                                </View>
                                            );
                                        })}

                                    {/* Show locally uploaded files that aren't yet in messages list (if any) */}
                                    {uploadedFiles.map((file, index) => (
                                        <View key={`local-${index}`} style={styles.chatMessageSent}>
                                            <View style={styles.chatHeader}>
                                                <BrandText style={styles.chatTime}>{formatMessageTime(file.timestamp)}</BrandText>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <BrandText style={styles.chatUser}>You</BrandText>
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
                                    ))}
                                </>
                            )}
                        </View>
                    </View>
                );
        }
    };

    const handleHold = async () => {
        setIsActionLoading(true);
        // "Freeze" the timer locally immediately
        setPausedTime(timer);
        try {
            await holdTask(task.id, timer);
            setIsPaused(true);
            showToast.success('Task Paused', 'Timer has been stopped on server');
        } catch (err: any) {
            console.log('Hold error:', err);
            // Revert freeze on error
            setPausedTime(null);
            showToast.error('Hold Failed', err.message || 'Could not pause task');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleResume = async () => {
        setIsActionLoading(true);
        try {
            await startTask(task.id);
            // Don't setPausedTime(null) here, let the useEffect handle it when the task actually updates
            setIsPaused(false);
            showToast.success('Task Resumed', 'Timer has restarted');
        } catch (err: any) {
            console.log('Resume error:', err);
            showToast.error('Resume Failed', err.message || 'Could not resume task');
        } finally {
            setIsActionLoading(false);
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
                            showToast.success('Task Completed', 'Your time has been logged successfully');
                        } catch (err: any) {
                            console.log('Completion error:', err);
                            showToast.error('Error', err.message || 'Failed to complete task');
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
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor={Colors.heritageGold}
                                colors={[Colors.heritageGold]}
                            />
                        }
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
                                <BrandText style={styles.timerDisplayText}>
                                    {timer} {isPaused ? 'Paused' : 'In Progress'}
                                </BrandText>
                            </View>

                            <View style={styles.actionButtonsRow}>
                                <TouchableOpacity
                                    style={[
                                        styles.holdResumeBtn,
                                        isPaused ? styles.resumeBtn : styles.holdBtn,
                                        isActionLoading && { opacity: 0.7 }
                                    ]}
                                    onPress={isPaused ? handleResume : handleHold}
                                    disabled={isActionLoading || isCompleting}
                                >
                                    {isActionLoading ? (
                                        <ActivityIndicator color={Colors.white} size="small" />
                                    ) : (
                                        <>
                                            <Icon name={isPaused ? "play" : "pause"} size={scale(18)} color={Colors.white} />
                                            <BrandText style={styles.actionBtnText}>
                                                {isPaused ? 'RESUME' : 'HOLD TASK'}
                                            </BrandText>
                                        </>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.finalCompleteBtn, isCompleting && { opacity: 0.7 }]}
                                    onPress={handleComplete}
                                    disabled={isActionLoading || isCompleting}
                                >
                                    {isCompleting ? (
                                        <ActivityIndicator color={Colors.white} size="small" />
                                    ) : (
                                        <BrandText style={styles.finalCompleteText}>FINISH</BrandText>
                                    )}
                                </TouchableOpacity>
                            </View>
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
    actionButtonsRow: {
        flexDirection: 'row',
        gap: scale(12),
    },
    holdResumeBtn: {
        flex: 1,
        height: verticalScale(48),
        borderRadius: scale(12),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: scale(8),
    },
    holdBtn: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    resumeBtn: {
        backgroundColor: '#27AE60',
    },
    actionBtnText: {
        fontWeight: 'bold',
        fontSize: rf(14),
        color: Colors.white,
    },
    finalCompleteBtn: {
        flex: 1,
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
