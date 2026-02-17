import React from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    StatusBar,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Fonts } from '../theme';
import Icon from '@expo/vector-icons/Ionicons';
import FAIcon from '@expo/vector-icons/FontAwesome5';
import BrandText from '../components/BrandText';
import BackgroundWrapper from '../components/BackgroundWrapper';
import { scale, verticalScale, rf, wp, hp } from '../utils/responsiveHelpers';

interface ReimbursementScreenProps {
    amount: string;
    onBack: () => void;
    onSubmit: () => void;
}

const ReimbursementScreen: React.FC<ReimbursementScreenProps> = ({ amount, onBack, onSubmit }) => {
    // Ensure amount is handled correctly even if empty
    const displayAmount = amount || '0';
    const numericValue = parseFloat(displayAmount.replace(/,/g, '')) || 0;
    const totalCalculated = numericValue.toLocaleString();

    const items = [
        { id: 1, type: 'Submission Amount', amount: totalCalculated, icon: 'receipt-outline' },
    ];

    return (
        <BackgroundWrapper>
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Icon name="chevron-back" size={scale(24)} color={Colors.white} />
                    </TouchableOpacity>
                    <BrandText variant="headline" withDot style={styles.headerTitle}>Reimbursement</BrandText>
                    <View style={styles.backButton} />
                </View>

                <ScrollView style={styles.content}>
                    <View style={styles.card}>
                        <View style={styles.totalHeader}>
                            <BrandText style={styles.totalLabel}>Total Reimbursable</BrandText>
                            <BrandText variant="headline" style={styles.totalValue}>{totalCalculated} PKR</BrandText>
                        </View>

                        <View style={styles.listContainer}>
                            {items.map((item) => (
                                <View key={item.id} style={styles.listItem}>
                                    <View style={styles.itemLeft}>
                                        <View style={styles.iconContainer}>
                                            <Icon name={item.icon as any} size={scale(20)} color={Colors.heritageGold} />
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
        padding: wp(6),
    },
    card: {
        backgroundColor: Colors.cardBackground,
        borderRadius: scale(20),
        padding: scale(20),
        borderWidth: 1,
        borderColor: Colors.divider,
    },
    totalHeader: {
        marginBottom: verticalScale(24),
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: rf(14),
        opacity: 0.5,
        marginBottom: verticalScale(4),
    },
    totalValue: {
        fontSize: rf(32),
        fontWeight: 'bold',
    },
    listContainer: {
        marginBottom: verticalScale(24),
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: verticalScale(16),
        borderBottomWidth: 1,
        borderBottomColor: Colors.divider,
    },
    itemLeft: {
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
    itemType: {
        fontSize: rf(16),
        fontWeight: '500',
    },
    itemAmount: {
        fontSize: rf(16),
        fontWeight: 'bold',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingVertical: verticalScale(12),
        borderRadius: scale(12),
        marginTop: verticalScale(16),
    },
    statusDot: {
        width: scale(8),
        height: scale(8),
        borderRadius: scale(4),
        backgroundColor: Colors.heritageGold,
        marginRight: scale(10),
    },
    statusText: {
        fontSize: rf(14),
        opacity: 0.8,
    },
    submitButton: {
        backgroundColor: Colors.heritageGold,
        height: verticalScale(60),
        borderRadius: scale(12),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: verticalScale(24),
        marginBottom: verticalScale(50),
    },
    submitButtonText: {
        fontWeight: 'bold',
        fontSize: rf(18),
    },
});

export default ReimbursementScreen;
