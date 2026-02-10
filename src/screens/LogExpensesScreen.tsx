import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    TextInput,
    SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FAIcon from 'react-native-vector-icons/FontAwesome5';
import { Colors, Spacing, Fonts } from '../theme';
import BrandText from '../components/BrandText';
import BackgroundWrapper from '../components/BackgroundWrapper';

interface LogExpensesScreenProps {
    onBack: () => void;
    onSubmit: () => void;
    onDashboard: () => void;
    onTasks: () => void;
    onProfile: () => void;
}

const LogExpensesScreen: React.FC<LogExpensesScreenProps> = ({ onBack, onSubmit, onDashboard, onTasks, onProfile }) => {
    const [amount, setAmount] = useState('500');
    const [expenseType, setExpenseType] = useState('Transport');
    const [hours, setHours] = useState('3');

    return (
        <BackgroundWrapper>
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="light-content" />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Icon name="chevron-back" size={24} color={Colors.white} />
                    </TouchableOpacity>
                    <BrandText variant="headline" withDot style={styles.headerTitle}>Log Expense</BrandText>
                    <View style={styles.backButton} />
                </View>

                <ScrollView style={styles.content}>
                    <View style={styles.card}>
                        {/* Amount Field */}
                        <View style={styles.inputGroup}>
                            <BrandText style={styles.label}>Amount</BrandText>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    value={amount}
                                    onChangeText={setAmount}
                                    keyboardType="numeric"
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                />
                                <BrandText style={styles.unitText}>PKR</BrandText>
                            </View>
                        </View>

                        {/* Expense Type Field */}
                        <View style={styles.inputGroup}>
                            <BrandText style={styles.label}>Expense Type</BrandText>
                            <TouchableOpacity style={styles.dropdown}>
                                <BrandText style={styles.dropdownText}>{expenseType}</BrandText>
                                <Icon name="chevron-down" size={20} color={Colors.heritageGold} />
                            </TouchableOpacity>
                        </View>

                        {/* Upload Receipt Button */}
                        <TouchableOpacity style={styles.uploadButton}>
                            <Icon name="camera-outline" size={20} color={Colors.white} style={{ marginRight: 10 }} />
                            <BrandText style={styles.uploadText}>Upload Receipt</BrandText>
                        </TouchableOpacity>

                        {/* Field Hours Field */}
                        <View style={[styles.inputGroup, { marginTop: Spacing.xl }]}>
                            <BrandText style={styles.label}>Field Hours</BrandText>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    value={hours}
                                    onChangeText={setHours}
                                    keyboardType="numeric"
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                />
                                <BrandText style={styles.unitText}>Hours</BrandText>
                            </View>
                        </View>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
                        <BrandText style={styles.submitButtonText}>Submit Expense</BrandText>
                    </TouchableOpacity>
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
                        <FAIcon name="briefcase" size={22} color={Colors.heritageGold} />
                        <BrandText style={[styles.navLabel, styles.activeNavText]}>Expenses</BrandText>
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
        padding: Spacing.l,
    },
    card: {
        backgroundColor: Colors.cardBackground,
        borderRadius: 20,
        padding: Spacing.xl,
        borderWidth: 1,
        borderColor: Colors.divider,
    },
    inputGroup: {
        marginBottom: Spacing.l,
    },
    label: {
        fontSize: 14,
        opacity: 0.5,
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.inputBackground,
        borderRadius: 12,
        paddingHorizontal: Spacing.m,
        height: 55,
        borderWidth: 1,
        borderColor: Colors.divider,
    },
    input: {
        flex: 1,
        color: Colors.white,
        fontSize: 16,
        fontFamily: Fonts.poppins,
    },
    unitText: {
        fontSize: 14,
        opacity: 0.5,
        marginLeft: 8,
    },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.inputBackground,
        borderRadius: 12,
        paddingHorizontal: Spacing.m,
        height: 55,
        borderWidth: 1,
        borderColor: Colors.divider,
    },
    dropdownText: {
        fontSize: 16,
        fontWeight: '500',
    },
    uploadButton: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 55,
        borderRadius: 12,
        marginTop: Spacing.s,
        borderWidth: 1,
        borderColor: Colors.divider,
        borderStyle: 'dashed',
    },
    uploadText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    submitButton: {
        backgroundColor: Colors.heritageGold,
        height: 60,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.xl,
        marginBottom: 50,
    },
    submitButtonText: {
        fontWeight: 'bold',
        fontSize: 18,
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

export default LogExpensesScreen;
