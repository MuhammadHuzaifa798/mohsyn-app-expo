import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Switch,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Fonts } from '../theme';
import Icon from '@expo/vector-icons/Ionicons';
import FAIcon from '@expo/vector-icons/FontAwesome5';
import BrandText from '../components/BrandText';
import BackgroundWrapper from '../components/BackgroundWrapper';
import { scale, verticalScale, rf, wp, hp } from '../utils/responsiveHelpers';
import { logout, getSessionData } from '../utils/odooApi';

interface ProfileScreenProps {
    onBack: () => void;
    onLogout: () => void;
    onTasks: () => void;
    onLogExpenses: () => void;
    onCalendar: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack, onLogout, onTasks, onLogExpenses, onCalendar }) => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [userInfo, setUserInfo] = useState({ name: '', email: '' });

    useEffect(() => {
        loadUserInfo();
    }, []);

    const loadUserInfo = async () => {
        const session = await getSessionData();
        if (session) {
            setUserInfo({
                name: session.userName || 'User',
                email: session.userEmail || '',
            });
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logout();
                            onLogout();
                        } catch (error) {
                            console.error('Logout error:', error);
                            onLogout(); // Still navigate to login even on error
                        }
                    },
                },
            ]
        );
    };

    return (
        <BackgroundWrapper>
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Icon name="chevron-back" size={scale(24)} color={Colors.white} />
                    </TouchableOpacity>
                    <BrandText variant="headline" style={styles.headerTitle}>Profile</BrandText>
                    <View style={styles.backButton} />
                </View>

                <ScrollView style={styles.content} bounces={false}>
                    {/* Profile Header Section */}
                    <View style={styles.profileHeader}>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatarCircle}>
                                <Icon name="person" size={scale(50)} color={Colors.white} />
                            </View>
                        </View>
                        <BrandText variant="headline" withDot style={styles.userName}>{userInfo.name}</BrandText>
                        <BrandText style={styles.userRole}>{userInfo.email}</BrandText>
                    </View>

                    {/* Settings Section */}
                    <View style={styles.settingsSection}>
                        <TouchableOpacity style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <View style={styles.iconContainer}>
                                    <Icon name="cash-outline" size={scale(20)} color={Colors.heritageGold} />
                                </View>
                                <BrandText style={styles.menuText}>My Profits</BrandText>
                            </View>
                            <Icon name="chevron-forward" size={scale(20)} color="rgba(255,255,255,0.3)" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <View style={styles.iconContainer}>
                                    <Icon name="notifications-outline" size={scale(20)} color={Colors.heritageGold} />
                                </View>
                                <BrandText style={styles.menuText}>Notifications</BrandText>
                            </View>
                            <Icon name="chevron-forward" size={scale(20)} color="rgba(255,255,255,0.3)" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                            <View style={styles.menuItemLeft}>
                                <View style={styles.iconContainer}>
                                    <Icon name="log-out-outline" size={scale(20)} color={Colors.heritageGold} />
                                </View>
                                <BrandText style={styles.menuText}>Logout</BrandText>
                            </View>
                            <Icon name="chevron-forward" size={scale(20)} color="rgba(255,255,255,0.3)" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.versionContainer}>
                        <BrandText style={styles.versionText}>App Vers Ion 10.0</BrandText>
                    </View>
                </ScrollView>

                {/* Bottom Navigation */}
                <View style={styles.bottomNav}>
                    <TouchableOpacity style={styles.navItem} onPress={onBack}>
                        <Icon name="home-outline" size={scale(24)} color={Colors.white} />
                        <BrandText style={styles.navLabel}>Dashboard</BrandText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={onTasks}>
                        <FAIcon name="file-alt" size={scale(22)} color={Colors.white} />
                        <BrandText style={styles.navLabel}>Tasks</BrandText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={onCalendar}>
                        <Icon name="calendar-outline" size={scale(24)} color={Colors.white} />
                        <BrandText style={styles.navLabel}>Calendar</BrandText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem}>
                        <Icon name="settings" size={scale(24)} color={Colors.heritageGold} />
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
    },
    profileHeader: {
        paddingVertical: verticalScale(32),
        alignItems: 'center',
    },
    avatarContainer: {
        width: scale(100),
        height: scale(100),
        borderRadius: scale(50),
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(16),
        borderWidth: 1,
        borderColor: Colors.divider,
    },
    avatarCircle: {
        width: scale(80),
        height: scale(80),
        borderRadius: scale(40),
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.heritageGold,
    },
    userName: {
        fontSize: rf(24),
        fontWeight: 'bold',
    },
    userRole: {
        fontSize: rf(14),
        opacity: 0.7,
        marginTop: verticalScale(4),
    },
    settingsSection: {
        marginHorizontal: wp(6),
        marginTop: verticalScale(24),
        backgroundColor: Colors.cardBackground,
        borderRadius: scale(16),
        padding: scale(16),
        borderWidth: 1,
        borderColor: Colors.divider,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: verticalScale(16),
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: scale(36),
        height: scale(36),
        borderRadius: scale(10),
        backgroundColor: 'rgba(232, 131, 47, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(16),
    },
    menuText: {
        fontSize: rf(16),
        fontWeight: '500',
    },
    versionContainer: {
        marginTop: verticalScale(48),
        alignItems: 'center',
        paddingBottom: verticalScale(32),
    },
    versionText: {
        fontSize: rf(12),
        opacity: 0.4,
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

export default ProfileScreen;
