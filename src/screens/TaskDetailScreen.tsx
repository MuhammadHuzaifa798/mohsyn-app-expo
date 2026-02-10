import React from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import { Colors, Spacing, Fonts } from '../theme';
import Icon from 'react-native-vector-icons/Ionicons';
import BrandText from '../components/BrandText';
import BackgroundWrapper from '../components/BackgroundWrapper';

interface TaskDetailScreenProps {
    task: any;
    onBack: () => void;
    onInProgress: () => void;
}

const TaskDetailScreen: React.FC<TaskDetailScreenProps> = ({ task, onBack, onInProgress }) => {
    return (
        <BackgroundWrapper>
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="light-content" />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Icon name="chevron-back" size={24} color={Colors.white} />
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
                                    <Icon name="business-outline" size={18} color={Colors.heritageGold} />
                                </View>
                                <View>
                                    <BrandText style={styles.label}>Client</BrandText>
                                    <BrandText style={styles.value}>{task ? task.company : 'Sarah Williamson'}</BrandText>
                                </View>
                            </View>

                            <View style={styles.detailRow}>
                                <View style={styles.iconContainer}>
                                    <Icon name="location-outline" size={18} color={Colors.heritageGold} />
                                </View>
                                <View>
                                    <BrandText style={styles.label}>Location</BrandText>
                                    <BrandText style={styles.value}>{task ? (task.location || '123 Pine St, Springfield') : '123 Pine St, Springfield'}</BrandText>
                                </View>
                            </View>

                            <View style={styles.detailRow}>
                                <View style={styles.iconContainer}>
                                    <Icon name="call-outline" size={18} color={Colors.heritageGold} />
                                </View>
                                <View>
                                    <BrandText style={styles.label}>Contact</BrandText>
                                    <BrandText style={styles.value}>23 09 2327 1654</BrandText>
                                </View>
                            </View>
                        </View>

                        <View style={styles.descriptionSection}>
                            <BrandText variant="headline" style={styles.sectionTitle}>Task Information</BrandText>
                            <BrandText style={styles.descriptionText}>
                                Go to the client's house at 123 Pine St in Sprippfield. Bring the necessary tool the iire orariarai orm anwhere atarintne, soun tatne inetnuord ting. Hoteee and further winning.
                            </BrandText>
                        </View>
                    </View>
                </ScrollView>

                {/* Bottom Action Area */}
                {task?.status !== 'Done' && (
                    <View style={styles.actionContainer}>
                        <TouchableOpacity style={styles.startButton} onPress={onInProgress}>
                            <BrandText style={styles.startButtonText}>
                                {task?.status === 'In Progress' ? 'CONTINUE TASK' : 'START TASK'}
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
        height: 100,
        paddingTop: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.m,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    backButton: {
        width: 40,
    },
    content: {
        flex: 1,
        padding: Spacing.l,
    },
    card: {
        backgroundColor: Colors.cardBackground,
        borderRadius: 20,
        padding: Spacing.xl,
        borderWidth: 1,
        borderColor: Colors.divider,
    },
    taskTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: Spacing.xl,
    },
    detailSection: {
        gap: Spacing.l,
        marginBottom: Spacing.xl,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(232, 131, 47, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.m,
    },
    label: {
        fontSize: 12,
        opacity: 0.5,
        marginBottom: 2,
    },
    value: {
        fontSize: 16,
        fontWeight: '500',
    },
    descriptionSection: {
        marginTop: Spacing.m,
        paddingTop: Spacing.l,
        borderTopWidth: 1,
        borderTopColor: Colors.divider,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: Spacing.m,
    },
    descriptionText: {
        fontSize: 14,
        lineHeight: 22,
        opacity: 0.8,
    },
    actionContainer: {
        padding: Spacing.l,
        backgroundColor: 'rgba(0, 35, 28, 0.8)',
    },
    startButton: {
        backgroundColor: Colors.heritageGold,
        height: 60,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    startButtonText: {
        fontWeight: 'bold',
        fontSize: 18,
    },
});

export default TaskDetailScreen;
