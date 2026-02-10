import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../theme';

interface BackgroundWrapperProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

const BackgroundWrapper: React.FC<BackgroundWrapperProps> = ({ children, style }) => {
    return (
        <View style={[styles.container, style]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.primary,
    },
});

export default BackgroundWrapper;
