import React from 'react';
import {
    StyleSheet,
    View,
    SafeAreaView,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FAIcon from 'react-native-vector-icons/FontAwesome5';
import { Colors, Spacing, Fonts } from '../theme';
import BrandText from '../components/BrandText';
import BackgroundWrapper from '../components/BackgroundWrapper';

interface DashboardScreenProps {
    tasks: any[];
    onStartTask: () => void;
    onLogExpenses: () => void;
    onProfile: () => void;
    onTasks: () => void;
    onCalendar: () => void;
    onTaskPress: (task: any) => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({
    tasks,
    onStartTask,
    onLogExpenses,
    onProfile,
    onTasks,
    onCalendar,
    onTaskPress
}) => {
    const totalTasks = tasks.length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
    const completedTasks = tasks.filter(t => t.status === 'Done').length;
    const upcomingTasks = tasks.filter(t => t.status !== 'Done').slice(0, 2);

    return (
        <BackgroundWrapper>
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="light-content" />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.menuButton}>
                        <Icon name="menu" size={30} color={Colors.white} />
                    </TouchableOpacity>
                    <Image
                        source={require('../assets/images/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <TouchableOpacity style={styles.profileButton} onPress={onProfile}>
                        <BrandText style={styles.headerProfileName}>John</BrandText>
                        <View style={styles.profileCircle}>
                            <Icon name="person" size={20} color={Colors.white} />
                        </View>
                    </TouchableOpacity>
                </View>

                <ScrollView bounces={false} style={styles.content}>
                    {/* Welcome Section */}
                    <View style={styles.welcomeSection}>
                        <BrandText variant="headline" withDot style={styles.welcomeText}>
                            Good Afternoon, John
                        </BrandText>
                        <BrandText style={styles.subWelcomeText}>
                            Please sign in to continue.
                        </BrandText>

                        {/* Stats Bar */}
                        <View style={styles.statsContainer}>
                            <View style={styles.statBox}>
                                <BrandText variant="headline" style={styles.statNumber}>{totalTasks}</BrandText>
                                <BrandText style={styles.statLabel}>Total Tasks</BrandText>
                            </View>
                            <View style={[styles.statBox, styles.statBoxActive]}>
                                <BrandText variant="headline" style={styles.statNumber}>{inProgressTasks}</BrandText>
                                <BrandText style={styles.statLabel}>In Progress</BrandText>
                            </View>
                            <View style={styles.statBox}>
                                <BrandText variant="headline" style={styles.statNumber}>{completedTasks}</BrandText>
                                <BrandText style={styles.statLabel}>Completed</BrandText>
                            </View>
                        </View>
                    </View>

                    {/* Upcoming Tasks Section */}
                    <View style={styles.tasksSection}>
                        <View style={styles.sectionHeader}>
                            <BrandText variant="headline" style={styles.sectionTitle}>Upcoming Tasks</BrandText>
                            <Icon name="chevron-up" size={20} color={Colors.white} />
                        </View>

                        {upcomingTasks.map((task) => (
                            <TouchableOpacity key={task.id} style={styles.taskCard} onPress={() => onTaskPress(task)}>
                                <View style={styles.taskCardHeader}>
                                    <View style={styles.taskAvatarPlaceholder}>
                                        <Icon name="person" size={24} color="#666" />
                                    </View>
                                    <View style={styles.taskTitleContainer}>
                                        <BrandText style={styles.taskTitle} numberOfLines={1}>{task.title}</BrandText>
                                        <View style={styles.taskSubtitleRow}>
                                            <Icon name="location-outline" size={14} color="#666" />
                                            <BrandText style={styles.taskSubtitle}>{task.company}</BrandText>
                                        </View>
                                        <View style={styles.taskSubtitleRow}>
                                            <Icon name="time-outline" size={14} color="#666" />
                                            <BrandText style={styles.taskSubtitle}>{task.date}</BrandText>
                                        </View>
                                    </View>
                                    <View style={styles.badge}>
                                        <BrandText style={styles.badgeText}>{task.status === 'In Progress' ? 'Active' : 'New'}</BrandText>
                                    </View>
                                </View>
                                <BrandText style={styles.taskDescription}>
                                    Scheduled task for {task.company}. Please ensure all tools are ready.
                                </BrandText>
                            </TouchableOpacity>
                        ))}

                        {/* Brand Signature Element */}
                        <View style={styles.signatureContainer}>
                            <View style={styles.signatureLine} />
                            <View style={styles.signatureDot} />
                        </View>
                    </View>
                </ScrollView>

                {/* Bottom Navigation */}
                <View style={styles.bottomNav}>
                    <TouchableOpacity style={styles.navItem}>
                        <Icon name="home" size={24} color={Colors.heritageGold} />
                        <BrandText style={[styles.navLabel, styles.activeNavText]}>Dashboard</BrandText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={onTasks}>
                        <FAIcon name="file-alt" size={22} color={Colors.white} />
                        <BrandText style={styles.navLabel}>Tasks</BrandText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={onCalendar}>
                        <Icon name="calendar-outline" size={24} color={Colors.white} />
                        <BrandText style={styles.navLabel}>Calendar</BrandText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={onProfile}>
                        <Icon name="settings-outline" size={24} color={Colors.white} />
                        <BrandText style={styles.navLabel}>Settings</BrandText>
                    </TouchableOpacity>
                </View>
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
    logo: {
        height: 30,
        width: 120,
    },
    menuButton: {
        width: 40,
    },
    profileButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerProfileName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.white,
        marginRight: 8,
    },
    profileCircle: {
        width: 35,
        height: 35,
        borderRadius: 17.5,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1.5,
        borderColor: Colors.heritageGold,
    },
    content: {
        flex: 1,
    },
    welcomeSection: {
        paddingHorizontal: Spacing.l,
        paddingTop: Spacing.xl,
        paddingBottom: Spacing.l,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: Spacing.xs,
    },
    subWelcomeText: {
        fontSize: 14,
        opacity: 0.7,
        marginBottom: Spacing.xl,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: Spacing.s,
    },
    statBox: {
        flex: 1,
        backgroundColor: Colors.cardBackground,
        borderRadius: 12,
        paddingVertical: Spacing.l,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.divider,
    },
    statBoxActive: {
        backgroundColor: Colors.heritageGold,
        borderColor: Colors.heritageGold,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 11,
        opacity: 0.9,
    },
    tasksSection: {
        paddingHorizontal: Spacing.l,
        marginTop: Spacing.m,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.m,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    taskCard: {
        backgroundColor: Colors.taskCardBg,
        borderRadius: 16,
        padding: Spacing.m,
        marginBottom: Spacing.m,
    },
    taskCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.s,
    },
    taskAvatarPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.m,
    },
    taskTitleContainer: {
        flex: 1,
    },
    taskTitle: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: Fonts.poppinsBold,
    },
    taskSubtitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    taskSubtitle: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        marginLeft: 4,
    },
    badge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgeText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    taskDescription: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 13,
        lineHeight: 18,
        marginTop: Spacing.s,
    },
    signatureContainer: {
        marginTop: Spacing.xxl,
        alignItems: 'center',
        opacity: 0.3,
    },
    signatureLine: {
        height: 1,
        width: 40,
        backgroundColor: Colors.white,
    },
    signatureDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.heritageGold,
        marginTop: 8,
    },
    bottomNav: {
        height: 80,
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 35, 28, 0.95)',
        borderTopWidth: 1,
        borderColor: Colors.divider,
        paddingBottom: 20,
    },
    navItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    navLabel: {
        fontSize: 10,
        marginTop: 4,
        opacity: 0.8,
    },
    activeNavText: {
        color: Colors.heritageGold,
        fontWeight: '600',
        opacity: 1,
    },
});

export default DashboardScreen;
