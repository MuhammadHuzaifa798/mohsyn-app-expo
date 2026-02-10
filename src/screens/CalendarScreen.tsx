import React, { useState, useMemo } from 'react';
import {
    StyleSheet,
    View,
    SafeAreaView,
    TouchableOpacity,
    StatusBar,
    ScrollView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Colors, Spacing } from '../theme';
import Icon from 'react-native-vector-icons/Ionicons';
import FAIcon from 'react-native-vector-icons/FontAwesome5';
import BrandText from '../components/BrandText';
import BackgroundWrapper from '../components/BackgroundWrapper';

interface CalendarScreenProps {
    tasks: any[];
    onTaskPress: (task: any) => void;
    onBack: () => void;
    onDashboard: () => void;
    onTasks: () => void;
    onProfile: () => void;
}

const CalendarScreen: React.FC<CalendarScreenProps> = ({
    tasks,
    onTaskPress,
    onBack,
    onDashboard,
    onTasks,
    onProfile
}) => {
    const today = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(today);

    // Helper to format date strings like "Apr 25, 2024" to "2024-04-25"
    const formatDateForCalendar = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return null;
            return date.toISOString().split('T')[0];
        } catch (e) {
            return null;
        }
    };

    const markedDates = useMemo(() => {
        const marks: any = {};

        tasks.forEach(task => {
            const dateKey = formatDateForCalendar(task.date);
            if (dateKey) {
                if (!marks[dateKey]) {
                    marks[dateKey] = { marked: true, dots: [] };
                }

                let dotColor = Colors.heritageGold; // Default
                if (task.status === 'Done') dotColor = '#27AE60';
                if (task.status === 'To Do') dotColor = '#95A5A6';

                marks[dateKey].dots = [...(marks[dateKey].dots || []), { color: dotColor }];
            }
        });

        // Highlight selected date
        if (marks[selectedDate]) {
            marks[selectedDate] = {
                ...marks[selectedDate],
                selected: true,
                selectedColor: 'rgba(232, 131, 47, 0.3)',
                selectedTextColor: Colors.white
            };
        } else {
            marks[selectedDate] = {
                selected: true,
                selectedColor: 'rgba(232, 131, 47, 0.3)',
                selectedTextColor: Colors.white
            };
        }

        return marks;
    }, [tasks, selectedDate]);

    const dailyTasks = tasks.filter(task => {
        const taskDate = formatDateForCalendar(task.date);
        return taskDate === selectedDate;
    });

    return (
        <BackgroundWrapper>
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="light-content" />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Icon name="chevron-back" size={24} color={Colors.white} />
                    </TouchableOpacity>
                    <BrandText variant="headline" style={styles.headerTitle}>Calendar</BrandText>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Calendar Component */}
                    <View style={styles.calendarCard}>
                        <Calendar
                            theme={{
                                backgroundColor: 'transparent',
                                calendarBackground: 'transparent',
                                textSectionTitleColor: 'rgba(255,255,255,0.4)',
                                selectedDayBackgroundColor: Colors.heritageGold,
                                selectedDayTextColor: '#ffffff',
                                todayTextColor: Colors.heritageGold,
                                dayTextColor: '#ffffff',
                                textDisabledColor: 'rgba(255,255,255,0.1)',
                                dotColor: Colors.heritageGold,
                                selectedDotColor: '#ffffff',
                                arrowColor: Colors.heritageGold,
                                monthTextColor: Colors.white,
                                indicatorColor: Colors.heritageGold,
                                textDayFontFamily: 'System',
                                textMonthFontFamily: 'System',
                                textDayHeaderFontFamily: 'System',
                                textDayFontWeight: '400',
                                textMonthFontWeight: 'bold',
                                textDayHeaderFontWeight: '400',
                                textDayFontSize: 16,
                                textMonthFontSize: 18,
                                textDayHeaderFontSize: 12
                            }}
                            markedDates={markedDates}
                            markingType={'multi-dot'}
                            onDayPress={(day: any) => setSelectedDate(day.dateString)}
                        />
                    </View>

                    {/* Agenda List */}
                    <View style={styles.agendaSection}>
                        <View style={styles.agendaHeader}>
                            <BrandText variant="headline" style={styles.agendaTitle}>
                                {selectedDate === today ? 'Today\'s Tasks' : `Tasks for ${selectedDate}`}
                            </BrandText>
                            <BrandText style={styles.taskCount}>{dailyTasks.length} Jobs</BrandText>
                        </View>

                        {dailyTasks.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Icon name="calendar-outline" size={48} color="rgba(255,255,255,0.1)" />
                                <BrandText style={styles.emptyText}>No tasks scheduled for this day</BrandText>
                            </View>
                        ) : (
                            dailyTasks.map((task) => (
                                <TouchableOpacity
                                    key={task.id}
                                    style={styles.taskItem}
                                    onPress={() => onTaskPress(task)}
                                >
                                    <View style={[styles.statusIndicator, { backgroundColor: task.statusColor }]} />
                                    <View style={styles.taskInfo}>
                                        <BrandText style={styles.taskTitle}>{task.title}</BrandText>
                                        <View style={styles.taskMeta}>
                                            <Icon name="business-outline" size={12} color="rgba(255,255,255,0.5)" />
                                            <BrandText style={styles.metaText}>{task.company}</BrandText>
                                            <Icon name="time-outline" size={12} color="rgba(255,255,255,0.5)" style={{ marginLeft: 12 }} />
                                            <BrandText style={styles.metaText}>{task.time || 'All Day'}</BrandText>
                                        </View>
                                    </View>
                                    <Icon name="chevron-forward" size={18} color="rgba(255,255,255,0.2)" />
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                </ScrollView>

                {/* Bottom Navigation */}
                <View style={styles.bottomNav}>
                    <TouchableOpacity style={styles.navItem} onPress={onDashboard}>
                        <Icon name="home-outline" size={24} color={Colors.white} />
                        <BrandText style={styles.navLabel}>Dashboard</BrandText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={onTasks}>
                        <FAIcon name="file-alt" size={22} color={Colors.white} />
                        <BrandText style={styles.navLabel}>Tasks</BrandText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem}>
                        <Icon name="calendar" size={24} color={Colors.heritageGold} />
                        <BrandText style={[styles.navLabel, styles.activeNavText]}>Calendar</BrandText>
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
    },
    backButton: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    calendarCard: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        margin: Spacing.m,
        borderRadius: 20,
        padding: Spacing.s,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    agendaSection: {
        padding: Spacing.m,
        paddingTop: 0,
    },
    agendaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.m,
        paddingHorizontal: 4,
    },
    agendaTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    taskCount: {
        fontSize: 12,
        opacity: 0.5,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        backgroundColor: 'rgba(255,255,255,0.01)',
        borderRadius: 16,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    emptyText: {
        marginTop: 12,
        opacity: 0.3,
        fontSize: 14,
    },
    taskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        padding: Spacing.m,
        marginBottom: Spacing.s,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    statusIndicator: {
        width: 4,
        height: '100%',
        borderRadius: 2,
        marginRight: 12,
    },
    taskInfo: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    taskMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 12,
        opacity: 0.5,
        marginLeft: 4,
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

export default CalendarScreen;
