import { Platform, PermissionsAndroid, Alert } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

/**
 * Request location permission on Android
 */
export const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Location Permission',
                    message: 'App needs location permission to track your field service tasks',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
            console.warn(err);
            return false;
        }
    }
    return true;
};

/**
 * Get current location
 */
export const getCurrentLocation = (): Promise<{ latitude: number; longitude: number } | null> => {
    return new Promise(async (resolve) => {
        try {
            const hasPermission = await requestLocationPermission();
            if (!hasPermission) {
                Alert.alert('Permission Denied', 'Location permission is required to track your tasks');
                resolve(null);
                return;
            }

            Geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    resolve({ latitude, longitude });
                },
                (error) => {
                    console.warn('Geolocation Error:', error);
                    resolve(null);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );
        } catch (e) {
            console.error('Fatal Geolocation Error:', e);
            resolve(null);
        }
    });
};

/**
 * Watch current location
 */
export const watchLocation = (
    onUpdate: (location: { latitude: number; longitude: number }) => void,
    onError: (error: string) => void
): (() => void) => {
    let watchId: number | null = null;

    try {
        watchId = Geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                onUpdate({ latitude, longitude });
            },
            (error) => {
                console.warn('Location Watch Error:', error);
                onError(error.message);
            },
            { enableHighAccuracy: true, distanceFilter: 10, interval: 5000, fastestInterval: 2000 }
        );
    } catch (e) {
        console.error('Failed to start watching location:', e);
        onError('Hardware or native module error');
    }

    return () => {
        if (watchId !== null) {
            Geolocation.clearWatch(watchId);
        }
    };
};
