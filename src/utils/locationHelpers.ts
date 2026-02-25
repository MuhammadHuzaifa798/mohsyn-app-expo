import * as Location from 'expo-location';
import { Alert } from 'react-native';

/**
 * Request location permission
 */
export const requestLocationPermission = async (): Promise<boolean> => {
    try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        return status === 'granted';
    } catch (err) {
        console.warn(err);
        return false;
    }
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

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            const { latitude, longitude } = location.coords;
            resolve({ latitude, longitude });
        } catch (e) {
            console.log('Fatal Geolocation Error:', e);
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
    let subscription: Location.LocationSubscription | null = null;

    const startWatching = async () => {
        try {
            const hasPermission = await requestLocationPermission();
            if (!hasPermission) {
                onError('Permission denied');
                return;
            }

            subscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    distanceInterval: 10,
                },
                (location) => {
                    const { latitude, longitude } = location.coords;
                    onUpdate({ latitude, longitude });
                }
            );
        } catch (e) {
            console.log('Failed to start watching location:', e);
            onError('Hardware or native module error');
        }
    };

    startWatching();

    return () => {
        if (subscription) {
            subscription.remove();
        }
    };
};
