import React from 'react';
import { Text, StyleSheet, TextStyle, TextProps, StyleProp } from 'react-native';
import { Colors, Fonts } from '../theme';

interface BrandTextProps extends TextProps {
    withDot?: boolean;
    style?: StyleProp<TextStyle>;
    variant?: 'headline' | 'body';
}

const BrandText: React.FC<BrandTextProps> = ({ children, withDot, style, variant = 'body', ...props }) => {
    const isHeadline = variant === 'headline';

    const textStyle = [
        isHeadline ? styles.headline : styles.body,
        style
    ];

    if (withDot && typeof children === 'string') {
        return (
            <Text style={textStyle} {...props}>
                {children}
                <Text style={{ color: Colors.heritageGold }}>.</Text>
            </Text>
        );
    }

    return <Text style={textStyle} {...props}>{children}</Text>;
};

const styles = StyleSheet.create({
    headline: {
        fontFamily: Fonts.playfair,
        color: Colors.white,
    },
    body: {
        fontFamily: Fonts.poppins,
        color: Colors.white,
    },
});

export default BrandText;
