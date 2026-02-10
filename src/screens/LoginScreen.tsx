import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    Image,
    StatusBar,
    Dimensions,
} from 'react-native';
import { Colors, Spacing, Fonts } from '../theme';
import Icon from 'react-native-vector-icons/Feather';
import BrandText from '../components/BrandText';
import BackgroundWrapper from '../components/BackgroundWrapper';

const { width } = Dimensions.get('window');

interface LoginScreenProps {
    onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    return (
        <BackgroundWrapper>
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" />
                <View style={styles.content}>

                    {/* Logo Section */}
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../assets/images/logo.png')}
                            style={styles.logoImage}
                            resizeMode="contain"
                        />
                    </View>

                    <BrandText variant="headline" withDot style={styles.title}>Login</BrandText>

                    {/* Input Section */}
                    <View style={styles.inputSection}>
                        <View style={styles.inputContainer}>
                            <Icon name="user" size={20} color={Colors.white} style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Username"
                                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Icon name="lock" size={20} color={Colors.white} style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    {/* Login Button */}
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={onLogin}
                    >
                        <BrandText style={styles.loginButtonText}>Log In</BrandText>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.forgotPassword}>
                        <BrandText style={styles.forgotPasswordText}>Forgot Password?</BrandText>
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
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.xxl * 1.5,
    },
    logoContainer: {
        marginBottom: Spacing.xxl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoImage: {
        width: width * 0.6,
        height: 80,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: Spacing.xl,
    },
    inputSection: {
        width: '100%',
        marginBottom: Spacing.l,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.inputBackground,
        borderRadius: 12,
        marginBottom: Spacing.m,
        paddingHorizontal: Spacing.m,
        height: 60,
        borderWidth: 1,
        borderColor: Colors.divider,
    },
    icon: {
        marginRight: Spacing.m,
        opacity: 0.7,
    },
    input: {
        flex: 1,
        color: Colors.white,
        fontSize: 16,
        fontFamily: Fonts.poppins,
    },
    loginButton: {
        width: '100%',
        height: 60,
        backgroundColor: Colors.heritageGold,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.m,
    },
    loginButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    forgotPassword: {
        marginTop: Spacing.xl,
    },
    forgotPasswordText: {
        opacity: 0.6,
        fontSize: 14,
    },
});

export default LoginScreen;
