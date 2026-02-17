import React from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/Ionicons';
import FAIcon from '@expo/vector-icons/FontAwesome5';
import { Colors, Spacing, Fonts } from '../theme';
import BrandText from '../components/BrandText';
import BackgroundWrapper from '../components/BackgroundWrapper';

import { scale, verticalScale, rf, wp, hp } from '../utils/responsiveHelpers';
import { getSessionData } from '../utils/odooApi';

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
    const [isUpcomingVisible, setIsUpcomingVisible] = React.useState(true);
    const [userName, setUserName] = React.useState('');

    React.useEffect(() => {
        loadUserInfo();
    }, []);

    const loadUserInfo = async () => {
        const session = await getSessionData();
        if (session && session.userName) {
            // Get first name only for display
            const firstName = session.userName.split(' ')[0];
            setUserName(firstName);
        }
    };

    const totalTasks = tasks.length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
    const completedTasks = tasks.filter(t => t.status === 'Done').length;
    const upcomingTasks = tasks.filter(t => t.status !== 'Done').slice(0, 2);

    return (
        <BackgroundWrapper>
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.menuButton}>
                        <Icon name="menu" size={scale(30)} color={Colors.white} />
                    </TouchableOpacity>
                    <Image
                        source={require('../assets/images/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <TouchableOpacity style={styles.profileButton} onPress={onProfile}>
                        <BrandText style={styles.headerProfileName}>{userName || 'User'}</BrandText>
                        <View style={styles.profileCircle}>
                            <Icon name="person" size={scale(20)} color={Colors.white} />
                        </View>
                    </TouchableOpacity>
                </View>

                <ScrollView bounces={false} style={styles.content}>
                    {/* Welcome Section */}
                    <View style={styles.welcomeSection}>
                        <BrandText variant="headline" withDot style={styles.welcomeText}>
                            Good Afternoon, {userName || 'User'}
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
                        <TouchableOpacity
                            style={styles.sectionHeader}
                            onPress={() => setIsUpcomingVisible(!isUpcomingVisible)}
                            activeOpacity={0.7}
                        >
                            <BrandText variant="headline" style={styles.sectionTitle}>Upcoming Tasks</BrandText>
                            <Icon
                                name={isUpcomingVisible ? "chevron-up" : "chevron-down"}
                                size={scale(20)}
                                color={Colors.white}
                            />
                        </TouchableOpacity>

                        {isUpcomingVisible && (
                            <>
                                {upcomingTasks.map((task) => (
                                    <TouchableOpacity key={task.id} style={styles.taskCard} onPress={() => onTaskPress(task)}>
                                        <View style={styles.taskCardHeader}>
                                            <View style={styles.taskAvatarPlaceholder}>
                                                <Icon name="person" size={scale(24)} color="#666" />
                                            </View>
                                            <View style={styles.taskTitleContainer}>
                                                <BrandText style={styles.taskTitle} numberOfLines={1}>{task.title}</BrandText>
                                                <View style={styles.taskSubtitleRow}>
                                                    <Icon name="location-outline" size={scale(14)} color="#666" />
                                                    <BrandText style={styles.taskSubtitle}>{task.company}</BrandText>
                                                </View>
                                                <View style={styles.taskSubtitleRow}>
                                                    <Icon name="time-outline" size={scale(14)} color="#666" />
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
                            </>
                        )}
                    </View>
                </ScrollView>

                {/* Bottom Navigation */}
                <View style={styles.bottomNav}>
                    <TouchableOpacity style={styles.navItem}>
                        <Icon name="home" size={scale(24)} color={Colors.heritageGold} />
                        <BrandText style={[styles.navLabel, styles.activeNavText]}>Dashboard</BrandText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={onTasks}>
                        <FAIcon name="file-alt" size={scale(22)} color={Colors.white} />
                        <BrandText style={styles.navLabel}>Tasks</BrandText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={onCalendar}>
                        <Icon name="calendar-outline" size={scale(24)} color={Colors.white} />
                        <BrandText style={styles.navLabel}>Calendar</BrandText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={onProfile}>
                        <Icon name="settings-outline" size={scale(24)} color={Colors.white} />
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
        height: verticalScale(65),
        paddingTop: verticalScale(10),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wp(5),
    },
    logo: {
        height: verticalScale(40),
        width: wp(35),
    },
    menuButton: {
        width: scale(40),
    },
    profileButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerProfileName: {
        fontSize: rf(14),
        fontWeight: 'bold',
        color: Colors.white,
        marginRight: scale(8),
    },
    profileCircle: {
        width: scale(35),
        height: scale(35),
        borderRadius: scale(17.5),
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
        paddingHorizontal: wp(6),
        paddingTop: verticalScale(24),
        paddingBottom: verticalScale(20),
    },
    welcomeText: {
        fontSize: rf(28),
        fontWeight: 'bold',
        marginBottom: verticalScale(4),
    },
    subWelcomeText: {
        fontSize: rf(14),
        opacity: 0.7,
        marginBottom: verticalScale(32),
    },
    statsContainer: {
        flexDirection: 'row',
        gap: scale(10),
    },
    statBox: {
        flex: 1,
        backgroundColor: Colors.cardBackground,
        borderRadius: scale(12),
        paddingVertical: verticalScale(20),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.divider,
    },
    statBoxActive: {
        backgroundColor: Colors.heritageGold,
        borderColor: Colors.heritageGold,
    },
    statNumber: {
        fontSize: rf(24),
        fontWeight: 'bold',
        marginBottom: verticalScale(4),
    },
    statLabel: {
        fontSize: rf(11),
        opacity: 0.9,
    },
    tasksSection: {
        paddingHorizontal: wp(6),
        marginTop: verticalScale(16),
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(16),
    },
    sectionTitle: {
        fontSize: rf(20),
        fontWeight: 'bold',
    },
    taskCard: {
        backgroundColor: Colors.taskCardBg,
        borderRadius: scale(16),
        padding: scale(16),
        marginBottom: verticalScale(16),
    },
    taskCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(8),
    },
    taskAvatarPlaceholder: {
        width: scale(44),
        height: scale(44),
        borderRadius: scale(22),
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(16),
    },
    taskTitleContainer: {
        flex: 1,
    },
    taskTitle: {
        color: Colors.white,
        fontSize: rf(18),
        fontWeight: 'bold',
        fontFamily: Fonts.poppinsBold,
    },
    taskSubtitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: verticalScale(2),
    },
    taskSubtitle: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: rf(12),
        marginLeft: scale(4),
    },
    badge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(4),
        borderRadius: scale(6),
    },
    badgeText: {
        color: Colors.white,
        fontSize: rf(10),
        fontWeight: 'bold',
    },
    taskDescription: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: rf(13),
        lineHeight: rf(18),
        marginTop: verticalScale(8),
    },
    signatureContainer: {
        marginTop: verticalScale(48),
        alignItems: 'center',
        opacity: 0.3,
        paddingBottom: verticalScale(20),
    },
    signatureLine: {
        height: 1,
        width: scale(40),
        backgroundColor: Colors.white,
    },
    signatureDot: {
        width: scale(6),
        height: scale(6),
        borderRadius: scale(3),
        backgroundColor: Colors.heritageGold,
        marginTop: verticalScale(8),
    },
    bottomNav: {
        height: verticalScale(70),
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 35, 28, 0.95)',
        borderTopWidth: 1,
        borderColor: Colors.divider,
        paddingBottom: verticalScale(10),
    },
    navItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    navLabel: {
        fontSize: rf(10),
        marginTop: verticalScale(4),
        opacity: 0.8,
    },
    activeNavText: {
        color: Colors.heritageGold,
        fontWeight: '600',
        opacity: 1,
    },
});

export default DashboardScreen;
