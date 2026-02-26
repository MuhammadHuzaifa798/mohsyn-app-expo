import React from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Fonts } from '../theme';
import Icon from '@expo/vector-icons/Ionicons';
import FAIcon from '@expo/vector-icons/FontAwesome5';
import BrandText from '../components/BrandText';
import BackgroundWrapper from '../components/BackgroundWrapper';

import { scale, verticalScale, rf, wp, hp } from '../utils/responsiveHelpers';

interface MyTasksScreenProps {
    tasks: any[];
    onTaskPress: (task: any) => void;
    onBack: () => void;
    onProfile: () => void;
    onDashboard: () => void;
    onLogExpenses: () => void;
    onCalendar?: () => void;
    onRefresh: () => Promise<void>;
    isLoading: boolean;
}

const MyTasksScreen: React.FC<MyTasksScreenProps> = ({
    tasks,
    onTaskPress,
    onBack,
    onProfile,
    onDashboard,
    onLogExpenses,
    onCalendar,
    onRefresh,
    isLoading
}) => {
    const [activeFilterState, setActiveFilter] = React.useState('All');
    const [refreshing, setRefreshing] = React.useState(false);

    const handleRefresh = async () => {
        setRefreshing(true);
        await onRefresh();
        setRefreshing(false);
    };

    const filters = ['All', 'To Do', 'In Progress', 'Approval', 'Done'];

    return (
        <BackgroundWrapper>
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Icon name="chevron-back" size={scale(24)} color={Colors.white} />
                    </TouchableOpacity>
                    <BrandText variant="headline" style={styles.headerTitle}>Tasks</BrandText>
                    <TouchableOpacity style={styles.searchButton}>
                        <Icon name="search" size={scale(24)} color={Colors.white} />
                    </TouchableOpacity>
                </View>

                {/* Filters */}
                <View style={styles.filterContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                        {filters.map((filter) => (
                            <TouchableOpacity
                                key={filter}
                                style={[styles.filterItem, activeFilterState === filter && styles.filterItemActive]}
                                onPress={() => setActiveFilter(filter)}
                            >
                                <BrandText style={[styles.filterText, activeFilterState === filter && styles.filterTextActive]}>
                                    {filter}
                                </BrandText>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={Colors.heritageGold}
                            colors={[Colors.heritageGold]}
                        />
                    }
                >
                    {tasks
                        .filter(task => activeFilterState === 'All' || task.status === activeFilterState)
                        .map((task) => (
                            <TouchableOpacity
                                key={task.id}
                                style={styles.taskCard}
                                onPress={() => onTaskPress(task)}
                            >
                                <View style={styles.cardHeader}>
                                    <View style={styles.avatarPlaceholder}>
                                        <Icon name="person" size={scale(20)} color="#666" />
                                    </View>
                                    <View style={styles.taskTitleContainer}>
                                        <View style={styles.titleRow}>
                                            <BrandText variant="headline" style={styles.taskTitle}>{task.title}</BrandText>
                                            <Icon name="chevron-forward" size={scale(16)} color="rgba(255,255,255,0.4)" />
                                        </View>
                                        <View style={styles.infoRow}>
                                            <Icon name="business-outline" size={scale(14)} color={Colors.heritageGold} />
                                            <BrandText style={styles.infoText}>{task.company}</BrandText>
                                        </View>
                                        <View style={styles.infoRow}>
                                            <Icon name="location-outline" size={scale(14)} color="rgba(255,255,255,0.4)" />
                                            <BrandText style={styles.infoText}>{task.location}</BrandText>
                                        </View>
                                        <View style={styles.infoRow}>
                                            <Icon name="call-outline" size={scale(14)} color="rgba(255,255,255,0.4)" />
                                            <BrandText style={styles.infoText}>{task.partner_phone || 'N/A'}</BrandText>
                                        </View>
                                        <View style={styles.infoRow}>
                                            <Icon name="calendar-outline" size={scale(14)} color="rgba(255,255,255,0.4)" />
                                            <BrandText style={styles.infoText}>{task.date} {task.time}</BrandText>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.cardFooter}>
                                    <View style={styles.footerInfo}>
                                    </View>
                                    {task.status === 'In Progress' ? (
                                        <View style={[styles.statusBadge, styles.inProgressBadge]}>
                                            <Icon name="time" size={scale(12)} color={Colors.heritageGold} style={{ marginRight: scale(4) }} />
                                            <BrandText style={styles.statusTextActive}>In Progress</BrandText>
                                        </View>
                                    ) : task.status === 'Approval' ? (
                                        <View style={[styles.statusBadge, styles.approvalBadge]}>
                                            <Icon name="checkmark-circle-outline" size={scale(12)} color="#3498DB" style={{ marginRight: scale(4) }} />
                                            <BrandText style={styles.statusTextApproval}>Approval</BrandText>
                                        </View>
                                    ) : task.status === 'Done' ? (
                                        <View style={[styles.statusBadge, styles.doneBadge]}>
                                            <BrandText style={styles.statusTextDone}>Done</BrandText>
                                        </View>
                                    ) : (
                                        <View style={[styles.statusBadge, styles.todoBadge]}>
                                            <BrandText style={styles.statusTextTodo}>To Do</BrandText>
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                </ScrollView>

                {/* Bottom Navigation */}
                <View style={styles.bottomNav}>
                    <TouchableOpacity style={styles.navItem} onPress={onDashboard}>
                        <Icon name="home-outline" size={scale(24)} color={Colors.white} />
                        <BrandText style={styles.navLabel}>Dashboard</BrandText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem}>
                        <FAIcon name="file-alt" size={scale(22)} color={Colors.heritageGold} />
                        <BrandText style={[styles.navLabel, styles.activeNavText]}>Tasks</BrandText>
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
        letterSpacing: 0.5,
    },
    backButton: {
        width: scale(40),
    },
    searchButton: {
        width: scale(40),
        alignItems: 'flex-end',
    },
    filterContainer: {
        marginBottom: verticalScale(16),
        marginTop: verticalScale(10),
    },
    filterScroll: {
        paddingHorizontal: wp(5),
        gap: scale(12),
    },
    filterItem: {
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(10),
        borderRadius: scale(10),
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    filterItemActive: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderColor: Colors.heritageGold,
    },
    filterText: {
        fontSize: rf(14),
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.97)',
    },
    filterTextActive: {
        color: Colors.white,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: wp(5),
        paddingTop: 0,
    },
    taskCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: scale(16),
        padding: scale(16),
        marginBottom: verticalScale(16),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    avatarPlaceholder: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(12),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    taskTitleContainer: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(4),
    },
    taskTitle: {
        fontSize: rf(18),
        fontWeight: 'bold',
        color: Colors.white,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: verticalScale(4),
    },
    infoText: {
        fontSize: rf(14),
        color: 'rgba(255, 255, 255, 1)',
        marginLeft: scale(8),
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: verticalScale(16),
    },
    footerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.4)',
        marginLeft: 6,
    },
    statusBadge: {
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(6),
        borderRadius: scale(8),
        flexDirection: 'row',
        alignItems: 'center',
    },
    inProgressBadge: {
        backgroundColor: 'rgba(232, 131, 47, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(232, 131, 47, 0.3)',
    },
    doneBadge: {
        backgroundColor: 'rgba(39, 174, 96, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(39, 174, 96, 0.3)',
    },
    approvalBadge: {
        backgroundColor: 'rgba(52, 152, 219, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(52, 152, 219, 0.3)',
    },
    todoBadge: {
        backgroundColor: 'rgba(149, 165, 166, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(149, 165, 166, 0.3)',
    },
    statusTextActive: {
        color: Colors.heritageGold,
        fontSize: rf(13),
        fontWeight: 'bold',
    },
    statusTextApproval: {
        color: '#3498DB',
        fontSize: rf(13),
        fontWeight: 'bold',
    },
    statusTextDone: {
        color: '#27AE60',
        fontSize: rf(13),
        fontWeight: 'bold',
    },
    statusTextTodo: {
        color: '#95A5A6',
        fontSize: rf(13),
        fontWeight: 'bold',
    },
    bottomNav: {
        height: verticalScale(70),
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 35, 28, 0.95)',
        borderTopWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
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
        opacity: 0.6,
    },
    activeNavText: {
        color: Colors.heritageGold,
        fontWeight: 'bold',
        opacity: 1,
    },
});

export default MyTasksScreen;
