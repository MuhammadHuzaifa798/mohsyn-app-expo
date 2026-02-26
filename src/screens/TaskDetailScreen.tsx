import React from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    StatusBar,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Fonts } from '../theme';
import Icon from '@expo/vector-icons/Ionicons';
import BrandText from '../components/BrandText';
import BackgroundWrapper from '../components/BackgroundWrapper';
import { scale, verticalScale, rf, wp, hp } from '../utils/responsiveHelpers';

interface TaskDetailScreenProps {
    task: any;
    onBack: () => void;
    onInProgress: () => void;
}

const TaskDetailScreen: React.FC<TaskDetailScreenProps> = ({ task, onBack, onInProgress }) => {
    // Auto-redirect to In Progress if the task is already active
    React.useEffect(() => {
        if (task?.status === 'In Progress') {
            onInProgress();
        }
    }, [task?.status]);

    return (
        <BackgroundWrapper>
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Icon name="chevron-back" size={scale(24)} color={Colors.white} />
                    </TouchableOpacity>
                    <BrandText variant="headline" style={styles.headerTitle}>Task Details</BrandText>
                    <View style={styles.backButton} />
                </View>

                <ScrollView style={styles.content}>
                    <View style={styles.card}>
                        <BrandText variant="headline" withDot style={styles.taskTitle}>
                            {task ? task.title : 'Repair AC Unit'}
                        </BrandText>

                        <View style={styles.detailSection}>
                            <View style={styles.detailRow}>
                                <View style={styles.iconContainer}>
                                    <Icon name="business-outline" size={scale(18)} color={Colors.heritageGold} />
                                </View>
                                <View>
                                    <BrandText style={styles.label}>Client</BrandText>
                                    <BrandText style={styles.value}>{task ? task.company : 'Sarah Williamson'}</BrandText>
                                </View>
                            </View>

                            <View style={styles.detailRow}>
                                <View style={styles.iconContainer}>
                                    <Icon name="location-outline" size={scale(18)} color={Colors.heritageGold} />
                                </View>
                                <View>
                                    <BrandText style={styles.label}>Location</BrandText>
                                    <BrandText style={styles.value}>{task ? (task.location || '123 Pine St, Springfield') : '123 Pine St, Springfield'}</BrandText>
                                </View>
                            </View>

                            <View style={styles.detailRow}>
                                <View style={styles.iconContainer}>
                                    <Icon name="call-outline" size={scale(18)} color={Colors.heritageGold} />
                                </View>
                                <View>
                                    <BrandText style={styles.label}>Contact</BrandText>
                                    <BrandText style={styles.value}>{task?.partner_phone || 'N/A'}</BrandText>
                                </View>
                            </View>

                            {(task?.category || task?.sub_category) && (
                                <View style={{ gap: verticalScale(20) }}>
                                    {task?.category && (
                                        <View style={styles.detailRow}>
                                            <View style={styles.iconContainer}>
                                                <Icon name="grid-outline" size={scale(18)} color={Colors.heritageGold} />
                                            </View>
                                            <View>
                                                <BrandText style={styles.label}>Category</BrandText>
                                                <BrandText style={styles.value}>{task.category}</BrandText>
                                            </View>
                                        </View>
                                    )}
                                    {task?.sub_category && (
                                        <View style={styles.detailRow}>
                                            <View style={styles.iconContainer}>
                                                <Icon name="list-outline" size={scale(18)} color={Colors.heritageGold} />
                                            </View>
                                            <View>
                                                <BrandText style={styles.label}>Sub Category</BrandText>
                                                <BrandText style={styles.value}>{task.sub_category}</BrandText>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>

                        <View style={styles.descriptionSection}>
                            <BrandText variant="headline" style={styles.sectionTitle}>Task Information</BrandText>
                            <BrandText style={styles.descriptionText}>
                                {task?.description || "Go to the client's house at 123 Pine St in Sprippfield. Bring the necessary tool the iire orariarai orm anwhere atarintne, soun tatne inetnuord ting. Hoteee and further winning."}
                            </BrandText>
                        </View>
                    </View>
                </ScrollView>

                {/* Bottom Action Area */}
                {task?.status !== 'Done' && (
                    <View style={styles.actionContainer}>
                        <TouchableOpacity style={styles.startButton} onPress={onInProgress}>
                            <BrandText style={styles.startButtonText}>
                                {task?.status === 'In Progress' || task?.status === 'On Hold' || (task?.status || '').toLowerCase().includes('progress') ? 'CONTINUE TASK' : 'START TASK'}
                            </BrandText>
                        </TouchableOpacity>
                    </View>
                )}
            </SafeAreaView>
        </BackgroundWrapper>
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
    headerTitle: {
        fontSize: rf(22),
        fontWeight: 'bold',
    },
    backButton: {
        width: scale(40),
    },
    content: {
        flex: 1,
        padding: scale(20),
    },
    card: {
        backgroundColor: Colors.cardBackground,
        borderRadius: scale(20),
        padding: scale(24),
        borderWidth: 1,
        borderColor: Colors.divider,
    },
    taskTitle: {
        fontSize: rf(28),
        fontWeight: 'bold',
        marginBottom: verticalScale(24),
    },
    detailSection: {
        gap: verticalScale(20),
        marginBottom: verticalScale(24),
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(12),
        backgroundColor: 'rgba(232, 131, 47, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(16),
    },
    label: {
        fontSize: rf(12),
        opacity: 0.5,
        marginBottom: verticalScale(2),
    },
    value: {
        fontSize: rf(16),
        fontWeight: '500',
    },
    descriptionSection: {
        marginTop: verticalScale(16),
        paddingTop: verticalScale(20),
        borderTopWidth: 1,
        borderTopColor: Colors.divider,
    },
    sectionTitle: {
        fontSize: rf(18),
        fontWeight: 'bold',
        marginBottom: verticalScale(16),
    },
    descriptionText: {
        fontSize: rf(14),
        lineHeight: rf(22),
        opacity: 0.8,
    },
    actionContainer: {
        padding: scale(20),
        backgroundColor: 'rgba(0, 35, 28, 0.8)',
    },
    startButton: {
        backgroundColor: Colors.heritageGold,
        height: verticalScale(55),
        borderRadius: scale(12),
        justifyContent: 'center',
        alignItems: 'center',
    },
    startButtonText: {
        fontWeight: 'bold',
        fontSize: rf(18),
    },
});

export default TaskDetailScreen;
