import { Dimensions, Platform, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Guideline sizes are based on standard ~5" screen mobile device (iPhone 11/Pixel 4)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

/**
 * Converts width percentage to DP.
 * @param widthPercent The percentage of screen width (0-100)
 */
export const wp = (widthPercent: number | string): number => {
    const elemWidth = typeof widthPercent === "number" ? widthPercent : parseFloat(widthPercent);
    return PixelRatio.roundToNearestPixel(SCREEN_WIDTH * elemWidth / 100);
};

/**
 * Converts height percentage to DP.
 * @param heightPercent The percentage of screen height (0-100)
 */
export const hp = (heightPercent: number | string): number => {
    const elemHeight = typeof heightPercent === "number" ? heightPercent : parseFloat(heightPercent);
    return PixelRatio.roundToNearestPixel(SCREEN_HEIGHT * elemHeight / 100);
};

/**
 * Scales a size based on screen width.
 * Useful for icons, spacing, and width-related dimensions.
 */
export const scale = (size: number): number => (SCREEN_WIDTH / guidelineBaseWidth) * size;

/**
 * Scales a size based on screen height.
 * Useful for heights and vertical spacing.
 */
export const verticalScale = (size: number): number => (SCREEN_HEIGHT / guidelineBaseHeight) * size;

/**
 * Scaled size with a factor, good for maintaining balance between scaling and readability.
 */
export const moderateScale = (size: number, factor = 0.5): number => size + (scale(size) - size) * factor;

/**
 * Scale font size based on screen size.
 */
export const rf = (size: number): number => {
    const scale = SCREEN_WIDTH / guidelineBaseWidth;
    const newSize = size * scale;
    if (Platform.OS === 'ios') {
        return Math.round(PixelRatio.roundToNearestPixel(newSize));
    }
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};

export const isSmallDevice = SCREEN_WIDTH < 375;
export const isTablet = SCREEN_WIDTH >= 768;
