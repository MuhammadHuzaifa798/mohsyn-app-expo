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
import FAIcon from 'react-native-vector-icons/FontAwesome5';
import BrandText from '../components/BrandText';
import BackgroundWrapper from '../components/BackgroundWrapper';

interface ReimbursementScreenProps {
    onBack: () => void;
    onSubmit: () => void;
}

const ReimbursementScreen: React.FC<ReimbursementScreenProps> = ({ onBack, onSubmit }) => {
    const items = [
        { id: 1, type: 'Transport', amount: '500', icon: 'car-outline' },
        { id: 2, type: 'Meals', amount: '700', icon: 'restaurant-outline' },
    ];

    return (
        <BackgroundWrapper>
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="light-content" />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Icon name="chevron-back" size={24} color={Colors.white} />
                    </TouchableOpacity>
                    <BrandText variant="headline" withDot style={styles.headerTitle}>Reimbursement</BrandText>
                    <View style={styles.backButton} />
                </View>

                <ScrollView style={styles.content}>
                    <View style={styles.card}>
                        <View style={styles.totalHeader}>
                            <BrandText style={styles.totalLabel}>Total Expenses</BrandText>
                            <BrandText variant="headline" style={styles.totalValue}>1,200 PKR</BrandText>
                        </View>

                        <View style={styles.listContainer}>
                            {items.map((item) => (
                                <View key={item.id} style={styles.listItem}>
                                    <View style={styles.itemLeft}>
                                        <View style={styles.iconContainer}>
                                            <Icon name={item.icon} size={20} color={Colors.heritageGold} />
                                        </View>
                                        <BrandText style={styles.itemType}>{item.type}</BrandText>
                                    </View>
                                    <BrandText style={styles.itemAmount}>{item.amount} PKR</BrandText>
                                </View>
                            ))}
                        </View>

                        <View style={styles.statusBadge}>
                            <View style={styles.statusDot} />
                            <BrandText style={styles.statusText}>Submitted for Review</BrandText>
                        </View>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
                        <BrandText style={styles.submitButtonText}>Request Payment</BrandText>
                    </TouchableOpacity>
                </ScrollView>
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
    totalHeader: {
        marginBottom: Spacing.xl,
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 14,
        opacity: 0.5,
        marginBottom: 4,
    },
    totalValue: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    listContainer: {
        marginBottom: Spacing.xl,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
    },
    itemLeft: {
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
    itemType: {
        fontSize: 16,
        fontWeight: '500',
    },
    itemAmount: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingVertical: 12,
        borderRadius: 12,
        marginTop: Spacing.m,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.heritageGold,
        marginRight: 10,
    },
    statusText: {
        fontSize: 14,
        opacity: 0.8,
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
});

export default ReimbursementScreen;
