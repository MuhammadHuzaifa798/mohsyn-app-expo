import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/Ionicons';
import FAIcon from '@expo/vector-icons/FontAwesome5';
import { Colors, Spacing, Fonts } from '../theme';
import BrandText from '../components/BrandText';
import BackgroundWrapper from '../components/BackgroundWrapper';
import { scale, verticalScale, rf, wp, hp } from '../utils/responsiveHelpers';

interface LogExpensesScreenProps {
    taskId?: string;
    onBack: () => void;
    onSubmit: (amount: string, notes: string, image?: string) => void;
    onDashboard: () => void;
    onTasks: () => void;
    onProfile: () => void;
}

import { takePhoto, pickImage, showUploadOptions, UploadedFile, uriToBase64 } from '../utils/uploadHelpers';
import { Image } from 'react-native';
import { showToast } from '../utils/toast';

const LogExpensesScreen: React.FC<LogExpensesScreenProps> = ({ taskId, onBack, onSubmit, onDashboard, onTasks, onProfile }) => {
    const [amount, setAmount] = useState('500');
    const [notes, setNotes] = useState('');
    const [receiptImage, setReceiptImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCameraUpload = async () => {
        const file = await takePhoto();
        if (file) setReceiptImage(file.uri);
    };

    const handleGalleryUpload = async () => {
        const file = await pickImage();
        if (file) setReceiptImage(file.uri);
    };

    const handleUploadPress = () => {
        showUploadOptions(handleCameraUpload, handleGalleryUpload);
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

                        {/* Upload Receipt Section */}
                        <View style={styles.inputGroup}>
                            <BrandText style={styles.label}>Receipt</BrandText>
                            {receiptImage ? (
                                <View style={styles.receiptPreviewContainer}>
                                    <Image source={{ uri: receiptImage }} style={styles.receiptPreview} />
                                    <TouchableOpacity style={styles.removeReceiptBtn} onPress={() => setReceiptImage(null)}>
                                        <Icon name="close-circle" size={scale(24)} color={Colors.heritageGold} />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity style={styles.uploadButton} onPress={handleUploadPress}>
                                    <Icon name="camera-outline" size={scale(20)} color={Colors.white} style={{ marginRight: scale(10) }} />
                                    <BrandText style={styles.uploadText}>Upload Receipt</BrandText>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Notes Field */}
                    <View style={[styles.inputGroup, { marginTop: verticalScale(24) }]}>
                        <BrandText style={styles.label}>Notes</BrandText>
                        <View style={[styles.inputWrapper, { height: verticalScale(100), alignItems: 'flex-start', paddingTop: verticalScale(12) }]}>
                            <TextInput
                                style={[styles.input, { textAlignVertical: 'top' }]}
                                value={notes}
                                onChangeText={setNotes}
                                placeholder="Add some details about the expense..."
                                placeholderTextColor="rgba(255,255,255,0.3)"
                                multiline
                            />
                        </View>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitButton, isSubmitting && { opacity: 0.7 }]}
                        onPress={async () => {
                            if (!amount || Number(amount) <= 0) {
                                showToast.error('Validation Error', 'Please enter a valid amount');
                                return;
                            }

                            setIsSubmitting(true);
                            try {
                                let base64Image = undefined;
                                if (receiptImage) {
                                    base64Image = await uriToBase64(receiptImage);
                                }
                                await onSubmit(amount, notes, base64Image);
                                showToast.success('Success', 'Expense logged successfully');
                            } catch (err: any) {
                                console.log(err);
                                showToast.error('Submission Failed', err.message || 'Could not log expense');
                            } finally {
                                setIsSubmitting(false);
                            }
                        }}
                        disabled={isSubmitting}
                    >
                        <BrandText style={styles.submitButtonText}>
                            {isSubmitting ? 'Submitting...' : 'Submit Expense'}
                        </BrandText>
                    </TouchableOpacity>
                </ScrollView>

                {/* Bottom Navigation */}
                <View style={styles.bottomNav}>
                    <TouchableOpacity style={styles.navItem} onPress={onDashboard}>
                        <Icon name="home-outline" size={scale(24)} color={Colors.white} />
                        <BrandText style={styles.navLabel}>Dashboard</BrandText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={onTasks}>
                        <FAIcon name="file-alt" size={scale(22)} color={Colors.white} />
                        <BrandText style={styles.navLabel}>Tasks</BrandText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem}>
                        <FAIcon name="briefcase" size={scale(22)} color={Colors.heritageGold} />
                        <BrandText style={[styles.navLabel, styles.activeNavText]}>Expenses</BrandText>
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
    inputGroup: {
        marginBottom: verticalScale(16),
    },
    label: {
        fontSize: rf(14),
        opacity: 0.5,
        marginBottom: verticalScale(8),
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.inputBackground,
        borderRadius: scale(12),
        paddingHorizontal: scale(16),
        height: verticalScale(55),
        borderWidth: 1,
        borderColor: Colors.divider,
    },
    input: {
        flex: 1,
        color: Colors.white,
        fontSize: rf(16),
        fontFamily: Fonts.poppins,
    },
    unitText: {
        fontSize: rf(14),
        opacity: 0.5,
        marginLeft: scale(8),
    },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.inputBackground,
        borderRadius: scale(12),
        paddingHorizontal: scale(16),
        height: verticalScale(55),
        borderWidth: 1,
        borderColor: Colors.divider,
    },
    dropdownText: {
        fontSize: rf(16),
        fontWeight: '500',
    },
    uploadButton: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: verticalScale(55),
        borderRadius: scale(12),
        marginTop: verticalScale(8),
        borderWidth: 1,
        borderColor: Colors.divider,
        borderStyle: 'dashed',
    },
    uploadText: {
        fontSize: rf(16),
        fontWeight: 'bold',
    },
    receiptPreviewContainer: {
        width: '100%',
        height: verticalScale(180),
        borderRadius: scale(12),
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: Colors.divider,
        position: 'relative',
    },
    receiptPreview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    removeReceiptBtn: {
        position: 'absolute',
        top: scale(8),
        right: scale(8),
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: scale(12),
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

export default LogExpensesScreen;
