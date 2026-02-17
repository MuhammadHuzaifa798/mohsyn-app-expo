import React from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    StatusBar,
    Linking,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/Ionicons';
import { Colors, Spacing } from '../theme';
import BrandText from '../components/BrandText';
import BackgroundWrapper from '../components/BackgroundWrapper';
import { requestLocationPermission } from '../utils/locationHelpers';
import { scale, verticalScale, rf, wp, hp } from '../utils/responsiveHelpers';

interface LocationPermissionScreenProps {
    onPermissionGranted: () => void;
}

const LocationPermissionScreen: React.FC<LocationPermissionScreenProps> = ({ onPermissionGranted }) => {

    const handleRequestAction = async () => {
        const granted = await requestLocationPermission();
        if (granted) {
            onPermissionGranted();
        } else {
            // If they denied it before, maybe show settings
            if (Platform.OS === 'ios' || Platform.OS === 'android') {
                // Link to app settings if already denied
                // linking.openSettings();
            }
        }
    };

    return (
        <BackgroundWrapper>
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <Icon name="location-outline" size={scale(80)} color={Colors.heritageGold} />
                        <View style={styles.pulse} />
                    </View>

                    <BrandText variant="headline" style={styles.title}>
                        Location Required
                    </BrandText>

                    <BrandText style={styles.description}>
                        To ensure accurate field service reporting and technician safety, this app requires access to your location while it is in use.
                    </BrandText>

                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Icon name="checkmark-circle" size={scale(20)} color={Colors.heritageGold} />
                            <BrandText style={styles.infoText}>Track Job Arrivals</BrandText>
                        </View>
                        <View style={styles.infoRow}>
                            <Icon name="checkmark-circle" size={scale(20)} color={Colors.heritageGold} />
                            <BrandText style={styles.infoText}>Real-time Distance Calculation</BrandText>
                        </View>
                        <View style={styles.infoRow}>
                            <Icon name="checkmark-circle" size={scale(20)} color={Colors.heritageGold} />
                            <BrandText style={styles.infoText}>Technician Safety Monitoring</BrandText>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.button} onPress={handleRequestAction}>
                        <BrandText style={styles.buttonText}>Enable Location</BrandText>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.settingsLink} onPress={() => Linking.openSettings()}>
                        <BrandText style={styles.settingsLinkText}>Open App Settings</BrandText>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </BackgroundWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: wp(10),
    },
    iconContainer: {
        marginBottom: verticalScale(40),
        alignItems: 'center',
        justifyContent: 'center',
    },
    pulse: {
        position: 'absolute',
        width: scale(120),
        height: scale(120),
        borderRadius: scale(60),
        backgroundColor: Colors.heritageGold,
        opacity: 0.1,
    },
    title: {
        fontSize: rf(24),
        fontWeight: 'bold',
        marginBottom: verticalScale(16),
        textAlign: 'center',
    },
    description: {
        textAlign: 'center',
        opacity: 0.7,
        lineHeight: rf(22),
        marginBottom: verticalScale(32),
    },
    infoCard: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: scale(16),
        padding: scale(20),
        marginBottom: verticalScale(40),
        borderWidth: 1,
        borderColor: Colors.divider,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    infoText: {
        marginLeft: scale(12),
        fontSize: rf(14),
        opacity: 0.9,
    },
    button: {
        backgroundColor: Colors.heritageGold,
        width: '100%',
        height: verticalScale(55),
        borderRadius: scale(12),
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.heritageGold,
        shadowOffset: { width: 0, height: verticalScale(4) },
        shadowOpacity: 0.3,
        shadowRadius: scale(8),
        elevation: 5,
    },
    buttonText: {
        color: Colors.white,
        fontSize: rf(16),
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    settingsLink: {
        marginTop: verticalScale(20),
        padding: scale(10),
    },
    settingsLinkText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: rf(14),
        textDecorationLine: 'underline',
    },
});

export default LocationPermissionScreen;
