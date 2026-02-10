import { launchCamera, launchImageLibrary, CameraOptions, ImageLibraryOptions, ImagePickerResponse } from 'react-native-image-picker';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import AudioRecorderPlayer, {
    AVEncoderAudioQualityIOSType,
    AVEncodingOption,
    AudioEncoderAndroidType,
    AudioSet,
    AudioSourceAndroidType,
    PlayBackType,
    RecordBackType,
} from 'react-native-audio-recorder-player';

export interface UploadedFile {
    uri: string;
    type: string;
    name: string;
    size?: number;
    duration?: string;
    timestamp?: number;
}

/**
 * Request camera permission on Android
 */
export const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: 'Camera Permission',
                    message: 'App needs camera permission to take photos',
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
 * Request audio recording permission on Android
 */
export const requestAudioPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
        try {
            const permissions = [PermissionsAndroid.PERMISSIONS.RECORD_AUDIO];

            // Add storage permissions only for older Android versions
            if (Platform.Version < 33) {
                permissions.push(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
                permissions.push(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
            }

            const grants = await PermissionsAndroid.requestMultiple(permissions);

            // Only strict requirement is RECORD_AUDIO
            return grants[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
            console.warn(err);
            return false;
        }
    }
    return true;
};

/**
 * Parse image picker response and return UploadedFile or null
 */
const parseImagePickerResponse = (response: ImagePickerResponse): UploadedFile | null => {
    if (response.didCancel) {
        console.log('User cancelled image picker');
        return null;
    }

    if (response.errorCode) {
        console.error('ImagePicker Error:', response.errorCode, response.errorMessage);
        Alert.alert('Error', response.errorMessage || 'Failed to process image');
        return null;
    }

    const assets = response.assets;
    if (!assets || assets.length === 0) {
        console.log('No assets returned');
        return null;
    }

    const asset = assets[0];
    if (!asset || !asset.uri) {
        console.log('No URI in asset');
        return null;
    }

    return {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || `image_${Date.now()}.jpg`,
        size: asset.fileSize,
    };
};

/**
 * Launch camera to take a photo using callback
 */
export const takePhoto = (): Promise<UploadedFile | null> => {
    return new Promise(async (resolve) => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
            Alert.alert('Permission Denied', 'Camera permission is required to take photos');
            resolve(null);
            return;
        }

        const options: CameraOptions = {
            mediaType: 'photo',
            quality: 0.8,
            saveToPhotos: true,
            cameraType: 'back',
        };

        launchCamera(options, (response: ImagePickerResponse) => {
            const file = parseImagePickerResponse(response);
            resolve(file);
        });
    });
};

/**
 * Pick an image from gallery using callback
 */
export const pickImage = (): Promise<UploadedFile | null> => {
    return new Promise((resolve) => {
        const options: ImageLibraryOptions = {
            mediaType: 'photo',
            quality: 0.8,
            selectionLimit: 1,
        };

        launchImageLibrary(options, (response: ImagePickerResponse) => {
            const file = parseImagePickerResponse(response);
            resolve(file);
        });
    });
};

const audioRecorderPlayer = new AudioRecorderPlayer();

/**
 * Start audio recording
 */
export const startAudioRecording = async (
    onRecordingStarted: () => void,
    onError: (error: string) => void
): Promise<{ stop: () => Promise<UploadedFile | null> } | null> => {
    const hasPermission = await requestAudioPermission();
    if (!hasPermission) {
        // Just try anyway for newer Android versions where permissions flow is different
        // or let the error handler catch it
    }

    try {
        const audioSet: AudioSet = {
            AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
            AudioSourceAndroid: AudioSourceAndroidType.MIC,
            AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
            AVNumberOfChannelsKeyIOS: 2,
            AVFormatIDKeyIOS: AVEncodingOption.aac,
        };

        const result = await audioRecorderPlayer.startRecorder(undefined, audioSet);
        audioRecorderPlayer.addRecordBackListener((e: RecordBackType) => {
            // console.log('record-back', e);
            return;
        });

        onRecordingStarted();

        return {
            stop: async (): Promise<UploadedFile | null> => {
                const result = await audioRecorderPlayer.stopRecorder();
                audioRecorderPlayer.removeRecordBackListener();

                // Calculate duration if possible or just use a placeholder
                // The result is the file path

                const file: UploadedFile = {
                    uri: result,
                    type: 'audio/mp4', // usually mp4/aac on android
                    name: `Voice Note.m4a`, // or .mp4
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

/**
 * Play audio file
 */
export const playAudio = (
    uri: string,
    onStart: () => void,
    onEnd: () => void,
    onError: (error: string) => void
): { stop: () => void } => {
    (async () => {
        try {
            await audioRecorderPlayer.stopPlayer(); // Ensure stopped
            const msg = await audioRecorderPlayer.startPlayer(uri);
            audioRecorderPlayer.addPlayBackListener((e: PlayBackType) => {
                if (e.currentPosition === e.duration) {
                    audioRecorderPlayer.stopPlayer();
                    onEnd();
                }
            });
            onStart();
        } catch (error: any) {
            console.log('play error', error);
            onError(error.message);
        }
    })();

    return {
        stop: async () => {
            await audioRecorderPlayer.stopPlayer();
            audioRecorderPlayer.removePlayBackListener();
            onEnd();
        }
    };
};

/**
 * Stop any playing audio
 */
export const stopAudio = async () => {
    await audioRecorderPlayer.stopPlayer();
    audioRecorderPlayer.removePlayBackListener();
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
