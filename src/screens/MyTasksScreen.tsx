import React from 'react';
import {
    StyleSheet,
    View,
    SafeAreaView,
    TouchableOpacity,
    StatusBar,
    ScrollView,
} from 'react-native';
import { Colors, Spacing, Fonts } from '../theme';
import Icon from 'react-native-vector-icons/Ionicons';
import FAIcon from 'react-native-vector-icons/FontAwesome5';
import BrandText from '../components/BrandText';
import BackgroundWrapper from '../components/BackgroundWrapper';

interface MyTasksScreenProps {
    tasks: any[];
    onTaskPress: (task: any) => void;
    onBack: () => void;
    onProfile: () => void;
    onDashboard: () => void;
    onLogExpenses: () => void;
    onCalendar?: () => void;
}

const MyTasksScreen: React.FC<MyTasksScreenProps> = ({ tasks, onTaskPress, onBack, onProfile, onDashboard, onLogExpenses, onCalendar }) => {
    const [activeFilter, setActiveFilter] = React.useState('All');
    const filters = ['All', 'To Do', 'In Progress', 'Done'];

    return (
        <BackgroundWrapper>
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="light-content" />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Icon name="chevron-back" size={24} color={Colors.white} />
                    </TouchableOpacity>
                    <BrandText variant="headline" style={styles.headerTitle}>Tasks</BrandText>
                    <TouchableOpacity style={styles.searchButton}>
                        <Icon name="search" size={24} color={Colors.white} />
                    </TouchableOpacity>
                </View>

                {/* Filters */}
                <View style={styles.filterContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                        {filters.map((filter) => (
                            <TouchableOpacity
                                key={filter}
                                style={[styles.filterItem, activeFilter === filter && styles.filterItemActive]}
                                onPress={() => setActiveFilter(filter)}
                            >
                                <BrandText style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
                                    {filter}
                                </BrandText>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                    {tasks
                        .filter(task => activeFilter === 'All' || task.status === activeFilter)
                        .map((task) => (
                            <TouchableOpacity
                                key={task.id}
                                style={styles.taskCard}
                                onPress={() => onTaskPress(task)}
                            >
                                <View style={styles.cardHeader}>
                                    <View style={styles.avatarPlaceholder}>
                                        <Icon name="person" size={20} color="#666" />
                                    </View>
                                    <View style={styles.taskTitleContainer}>
                                        <View style={styles.titleRow}>
                                            <BrandText variant="headline" style={styles.taskTitle}>{task.title}</BrandText>
                                            <Icon name="chevron-forward" size={16} color="rgba(255,255,255,0.4)" />
                                        </View>
                                        <View style={styles.infoRow}>
                                            <Icon name="location-outline" size={14} color={Colors.heritageGold} />
                                            <BrandText style={styles.infoText}>{task.company}</BrandText>
                                        </View>
                                        <View style={styles.infoRow}>
                                            <Icon name="call-outline" size={14} color="rgba(255,255,255,0.4)" />
                                            <BrandText style={styles.infoText}>{task.location || task.time}</BrandText>
                                        </View>
                                        <View style={styles.infoRow}>
                                            <Icon name="calendar-outline" size={14} color="rgba(255,255,255,0.4)" />
                                            <BrandText style={styles.infoText}>{task.date}</BrandText>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.cardFooter}>
                                    <View style={styles.footerInfo}>
                                    </View>
                                    {task.status === 'In Progress' ? (
                                        <View style={[styles.statusBadge, styles.inProgressBadge]}>
                                            <Icon name="time" size={12} color={Colors.heritageGold} style={{ marginRight: 4 }} />
                                            <BrandText style={styles.statusTextActive}>In Progress</BrandText>
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
                        <Icon name="home-outline" size={24} color={Colors.white} />
                        <BrandText style={styles.navLabel}>Dashboard</BrandText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem}>
                        <FAIcon name="file-alt" size={22} color={Colors.heritageGold} />
                        <BrandText style={[styles.navLabel, styles.activeNavText]}>Tasks</BrandText>
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
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    backButton: {
        width: 40,
    },
    searchButton: {
        width: 40,
        alignItems: 'flex-end',
    },
    filterContainer: {
        marginBottom: Spacing.m,
    },
    filterScroll: {
        paddingHorizontal: Spacing.m,
        gap: 12,
    },
    filterItem: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    filterItemActive: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderColor: Colors.heritageGold,
    },
    filterText: {
        fontSize: 14,
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
        padding: Spacing.m,
        paddingTop: 0,
    },
    taskCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16,
        padding: Spacing.m,
        marginBottom: Spacing.m,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
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
        marginBottom: 4,
    },
    taskTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.white,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    infoText: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 1)',
        marginLeft: 8,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
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
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
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
    todoBadge: {
        backgroundColor: 'rgba(149, 165, 166, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(149, 165, 166, 0.3)',
    },
    statusTextActive: {
        color: Colors.heritageGold,
        fontSize: 13,
        fontWeight: 'bold',
    },
    statusTextDone: {
        color: '#27AE60',
        fontSize: 13,
        fontWeight: 'bold',
    },
    statusTextTodo: {
        color: '#95A5A6',
        fontSize: 13,
        fontWeight: 'bold',
    },
    bottomNav: {
        height: 80,
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 35, 28, 0.95)',
        borderTopWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
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
        opacity: 0.6,
    },
    activeNavText: {
        color: Colors.heritageGold,
        fontWeight: 'bold',
        opacity: 1,
    },
});

export default MyTasksScreen;
