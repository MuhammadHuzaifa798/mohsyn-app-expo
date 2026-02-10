import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Switch,
    SafeAreaView,
} from 'react-native';
import { Colors, Spacing, Fonts } from '../theme';
import Icon from 'react-native-vector-icons/Ionicons';
import FAIcon from 'react-native-vector-icons/FontAwesome5';
import BrandText from '../components/BrandText';
import BackgroundWrapper from '../components/BackgroundWrapper';

interface ProfileScreenProps {
    onBack: () => void;
    onLogout: () => void;
    onTasks: () => void;
    onLogExpenses: () => void;
    onCalendar: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack, onLogout, onTasks, onLogExpenses, onCalendar }) => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    return (
        <BackgroundWrapper>
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="light-content" />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Icon name="chevron-back" size={24} color={Colors.white} />
                    </TouchableOpacity>
                    <BrandText variant="headline" style={styles.headerTitle}>Profile</BrandText>
                    <View style={styles.backButton} />
                </View>

                <ScrollView style={styles.content} bounces={false}>
                    {/* Profile Header Section */}
                    <View style={styles.profileHeader}>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatarCircle}>
                                <Icon name="person" size={50} color={Colors.white} />
                            </View>
                        </View>
                        <BrandText variant="headline" withDot style={styles.userName}>John Smith</BrandText>
                        <BrandText style={styles.userRole}>Field Service Officer</BrandText>
                    </View>

                    {/* Settings Section */}
                    <View style={styles.settingsSection}>
                        <TouchableOpacity style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <View style={styles.iconContainer}>
                                    <Icon name="cash-outline" size={20} color={Colors.heritageGold} />
                                </View>
                                <BrandText style={styles.menuText}>My Profits</BrandText>
                            </View>
                            <Icon name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <View style={styles.iconContainer}>
                                    <Icon name="notifications-outline" size={20} color={Colors.heritageGold} />
                                </View>
                                <BrandText style={styles.menuText}>Notifications</BrandText>
                            </View>
                            <Icon name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={onLogout}>
                            <View style={styles.menuItemLeft}>
                                <View style={styles.iconContainer}>
                                    <Icon name="log-out-outline" size={20} color={Colors.heritageGold} />
                                </View>
                                <BrandText style={styles.menuText}>Logout</BrandText>
                            </View>
                            <Icon name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.versionContainer}>
                        <BrandText style={styles.versionText}>App Vers Ion 10.0</BrandText>
                    </View>
                </ScrollView>

                {/* Bottom Navigation */}
                <View style={styles.bottomNav}>
                    <TouchableOpacity style={styles.navItem} onPress={onBack}>
                        <Icon name="home-outline" size={24} color={Colors.white} />
                        <BrandText style={styles.navLabel}>Dashboard</BrandText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={onTasks}>
                        <FAIcon name="file-alt" size={22} color={Colors.white} />
                        <BrandText style={styles.navLabel}>Tasks</BrandText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={onCalendar}>
                        <Icon name="calendar-outline" size={24} color={Colors.white} />
                        <BrandText style={styles.navLabel}>Calendar</BrandText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem}>
                        <Icon name="settings" size={24} color={Colors.heritageGold} />
                        <BrandText style={[styles.navLabel, styles.activeNavText]}>Settings</BrandText>
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
        height: 60,
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
    profileHeader: {
        paddingVertical: Spacing.xxl,
        alignItems: 'center',
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.m,
        borderWidth: 1,
        borderColor: Colors.divider,
    },
    avatarCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.heritageGold,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    userRole: {
        fontSize: 14,
        opacity: 0.7,
        marginTop: 4,
    },
    settingsSection: {
        marginHorizontal: Spacing.l,
        marginTop: Spacing.l,
        backgroundColor: Colors.cardBackground,
        borderRadius: 16,
        padding: Spacing.m,
        borderWidth: 1,
        borderColor: Colors.divider,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(232, 131, 47, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.m,
    },
    menuText: {
        fontSize: 16,
        fontWeight: '500',
    },
    versionContainer: {
        marginTop: Spacing.xxl,
        alignItems: 'center',
        paddingBottom: Spacing.xl,
    },
    versionText: {
        fontSize: 12,
        opacity: 0.4,
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

export default ProfileScreen;
