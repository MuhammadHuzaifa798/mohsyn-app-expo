import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { Audio } from 'expo-av';
import { File } from 'expo-file-system';

export interface UploadedFile {
    uri: string;
    type: string;
    name: string;
    size?: number;
    duration?: string;
    timestamp?: number;
}

/**
 * Request camera permission
 */
export const requestCameraPermission = async (): Promise<boolean> => {
    try {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        return status === 'granted';
    } catch (err) {
        console.warn(err);
        return false;
    }
};

/**
 * Request audio recording permission
 */
export const requestAudioPermission = async (): Promise<boolean> => {
    try {
        const { status } = await Audio.requestPermissionsAsync();
        return status === 'granted';
    } catch (err) {
        console.warn(err);
        return false;
    }
};

/**
 * Launch camera to take a photo
 */
export const takePhoto = async (): Promise<UploadedFile | null> => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
        Alert.alert('Permission Denied', 'Camera permission is required to take photos');
        return null;
    }

    const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
    }

    const asset = result.assets[0];
    return {
        uri: asset.uri,
        type: asset.mimeType || 'image/jpeg',
        name: asset.fileName || `image_${Date.now()}.jpg`,
        size: asset.fileSize,
    };
};

/**
 * Pick an image from gallery
 */
export const pickImage = async (): Promise<UploadedFile | null> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Media library permission is required to pick photos');
        return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
        selectionLimit: 1,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
    }

    const asset = result.assets[0];
    return {
        uri: asset.uri,
        type: asset.mimeType || 'image/jpeg',
        name: asset.fileName || `image_${Date.now()}.jpg`,
        size: asset.fileSize,
    };
};

let recording: Audio.Recording | null = null;

/**
 * Start audio recording
 */
export const startAudioRecording = async (
    onRecordingStarted: () => void,
    onError: (error: string) => void
): Promise<{ stop: () => Promise<UploadedFile | null> } | null> => {
    const hasPermission = await requestAudioPermission();
    if (!hasPermission) {
        onError('Permission denied');
        return null;
    }

    try {
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
        });

        const { recording: newRecording } = await Audio.Recording.createAsync(
            Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        recording = newRecording;
        onRecordingStarted();

        return {
            stop: async (): Promise<UploadedFile | null> => {
                if (!recording) return null;

                await recording.stopAndUnloadAsync();
                const uri = recording.getURI();
                recording = null;

                if (!uri) return null;

                const file: UploadedFile = {
                    uri: uri,
                    type: 'audio/m4a',
                    name: `Voice Note.m4a`,
                    size: undefined,
                };

                return file;
            }
        };
    } catch (error: any) {
        console.error('Audio recording error:', error);
        onError(error.message || 'Failed to start recording');
        return null;
    }
};

let sound: Audio.Sound | null = null;

/**
 * Play audio file
 */
export const playAudio = (
    uri: string,
    onStart: () => void,
    onEnd: () => void,
    onError: (error: string) => void
): { stop: () => void } => {
    const play = async () => {
        try {
            if (sound) {
                await sound.unloadAsync();
            }

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri },
                { shouldPlay: true }
            );
            sound = newSound;

            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && status.didJustFinish) {
                    onEnd();
                }
            });

            onStart();
        } catch (error: any) {
            console.log('play error', error);
            onError(error.message);
        }
    };

    play();

    return {
        stop: async () => {
            if (sound) {
                await sound.stopAsync();
                onEnd();
            }
        }
    };
};

/**
 * Stop any playing audio
 */
export const stopAudio = async () => {
    if (sound) {
        await sound.stopAsync();
    }
};

/**
 * Show upload options dialog
 */
export const showUploadOptions = (
    onCamera: () => void,
    onGallery: () => void
) => {
    const buttons: Array<{ text: string; onPress?: () => void; style?: 'cancel' | 'default' | 'destructive' }> = [
        { text: 'Take Photo', onPress: onCamera },
        { text: 'Choose from Gallery', onPress: onGallery },
        { text: 'Cancel', style: 'cancel' },
    ];

    Alert.alert('Upload Photo', 'Choose an option', buttons);
};

/**
 * Convert URI to Base64
 */
export const uriToBase64 = async (uri: string): Promise<string> => {
    try {
        const file = new File(uri);
        return await file.base64();
    } catch (error) {
        console.error('Error converting URI to base64:', error);
        throw error;
    }
};
