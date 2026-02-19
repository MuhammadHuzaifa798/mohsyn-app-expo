import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    TextInput,
    TouchableOpacity,
    Image,
    StatusBar,
    KeyboardAvoidingView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Fonts } from '../theme';
import Icon from '@expo/vector-icons/Feather';
import BrandText from '../components/BrandText';
import BackgroundWrapper from '../components/BackgroundWrapper';
import { scale, verticalScale, rf, wp } from '../utils/responsiveHelpers';
import { loginToOdoo } from '../utils/odooApi';
import { useTasks } from '../hooks/useTasks';

interface LoginScreenProps {
    onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const { refreshTasks } = useTasks();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        // Validation
        if (!username.trim()) {
            Alert.alert('Error', 'Please enter your username/email');
            return;
        }
        if (!password.trim()) {
            Alert.alert('Error', 'Please enter your password');
            return;
        }

        setIsLoading(true);

        try {
            const result = await loginToOdoo(username.trim(), password);

            if (result && result.status === 'success') {
                // Refresh tasks before navigating
                await refreshTasks();
                // Login successful - navigate to Dashboard
                onLogin();
            }
        } catch (error: any) {
            Alert.alert(
                'Login Failed',
                error.message || 'Unable to connect to server. Please check your credentials and try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <BackgroundWrapper>
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
                <KeyboardAvoidingView
                    behavior="padding"
                    style={{ flex: 1 }}
                >
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
                                <Icon name="user" size={scale(20)} color={Colors.white} style={styles.icon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email / Username"
                                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                                    value={username}
                                    onChangeText={setUsername}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    editable={!isLoading}
                                    returnKeyType="next"
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Icon name="lock" size={scale(20)} color={Colors.white} style={styles.icon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Password"
                                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    editable={!isLoading}
                                    returnKeyType="done"
                                    onSubmitEditing={handleLogin}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeIcon}
                                >
                                    <Icon
                                        name={showPassword ? 'eye-off' : 'eye'}
                                        size={scale(20)}
                                        color={Colors.white}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Login Button */}
                        <TouchableOpacity
                            style={[
                                styles.loginButton,
                                isLoading && styles.loginButtonDisabled,
                            ]}
                            onPress={handleLogin}
                            disabled={isLoading}
                            activeOpacity={0.8}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color={Colors.white} />
                            ) : (
                                <BrandText style={styles.loginButtonText}>Log In</BrandText>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.forgotPassword}>
                            <BrandText style={styles.forgotPasswordText}>Forgot Password?</BrandText>
                        </TouchableOpacity>

                    </View>
                </KeyboardAvoidingView>
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
        paddingHorizontal: wp(8),
        paddingTop: verticalScale(120),
    },
    logoContainer: {
        marginBottom: verticalScale(40),
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoImage: {
        width: wp(60),
        height: verticalScale(80),
    },
    title: {
        fontSize: rf(32),
        fontWeight: 'bold',
        marginBottom: verticalScale(32),
    },
    inputSection: {
        width: '100%',
        marginBottom: verticalScale(24),
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.inputBackground,
        borderRadius: scale(12),
        marginBottom: verticalScale(16),
        paddingHorizontal: scale(16),
        height: verticalScale(55),
        borderWidth: 1,
        borderColor: Colors.divider,
    },
    icon: {
        marginRight: scale(12),
        opacity: 0.7,
    },
    eyeIcon: {
        padding: scale(4),
        opacity: 0.7,
    },
    input: {
        flex: 1,
        color: Colors.white,
        fontSize: rf(16),
        fontFamily: Fonts.poppins,
    },
    loginButton: {
        width: '100%',
        height: verticalScale(55),
        backgroundColor: Colors.heritageGold,
        borderRadius: scale(12),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: verticalScale(16),
    },
    loginButtonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        fontSize: rf(18),
        fontWeight: 'bold',
    },
    forgotPassword: {
        marginTop: verticalScale(32),
    },
    forgotPasswordText: {
        opacity: 0.6,
        fontSize: rf(14),
    },
});

export default LoginScreen;
