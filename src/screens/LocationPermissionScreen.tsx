import React from 'react';
import {
    StyleSheet,
    View,
    SafeAreaView,
    TouchableOpacity,
    StatusBar,
    Linking,
    Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors, Spacing } from '../theme';
import BrandText from '../components/BrandText';
import BackgroundWrapper from '../components/BackgroundWrapper';
import { requestLocationPermission } from '../utils/locationHelpers';

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
                <StatusBar barStyle="light-content" />
                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <Icon name="location-outline" size={80} color={Colors.heritageGold} />
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
                            <Icon name="checkmark-circle" size={20} color={Colors.heritageGold} />
                            <BrandText style={styles.infoText}>Track Job Arrivals</BrandText>
                        </View>
                        <View style={styles.infoRow}>
                            <Icon name="checkmark-circle" size={20} color={Colors.heritageGold} />
                            <BrandText style={styles.infoText}>Real-time Distance Calculation</BrandText>
                        </View>
                        <View style={styles.infoRow}>
                            <Icon name="checkmark-circle" size={20} color={Colors.heritageGold} />
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
        paddingHorizontal: 40,
    },
    iconContainer: {
        marginBottom: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pulse: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: Colors.heritageGold,
        opacity: 0.1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    description: {
        textAlign: 'center',
        opacity: 0.7,
        lineHeight: 22,
        marginBottom: 32,
    },
    infoCard: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 40,
        borderWidth: 1,
        borderColor: Colors.divider,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoText: {
        marginLeft: 12,
        fontSize: 14,
        opacity: 0.9,
    },
    button: {
        backgroundColor: Colors.heritageGold,
        width: '100%',
        height: 55,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.heritageGold,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    settingsLink: {
        marginTop: 20,
        padding: 10,
    },
    settingsLinkText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
});

export default LocationPermissionScreen;
