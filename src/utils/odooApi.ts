/**
 * Odoo API Service
 * Handles all API communication with the Odoo backend
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// ⚠️ CONFIGURATION - UPDATE THIS VALUE ⚠️
// ============================================
const ODOO_URL = 'http://192.168.100.53:8019';  // Your computer's WiFi IP

// API Endpoints
const ENDPOINTS = {
    LOGIN: '/prodo/api/login',
    USER_INFO: '/prodo/api/user_info',
};

// Storage Keys
export const STORAGE_KEYS = {
    SESSION_ID: 'session_id',
    USER_NAME: 'user_name',
    USER_ID: 'uid',
    USER_EMAIL: 'user_email',
};

// Response Types
export interface LoginResponse {
    status: 'success' | 'error';
    message?: string;
    name?: string;
    uid?: number;
    session_id?: string;
    email?: string;
}

export interface ApiResponse<T> {
    jsonrpc: string;
    id?: number;
    result?: T;
    error?: {
        code: number;
        message: string;
        data?: any;
    };
}

/**
 * Make a JSON-RPC request to Odoo
 */
const makeRequest = async <T>(
    endpoint: string,
    params: any,
    requiresAuth: boolean = false
): Promise<T> => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    // Add session ID if authentication is required
    if (requiresAuth) {
        const sessionId = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_ID);
        if (sessionId) {
            headers['X-Odoo-Session-Id'] = sessionId;
        }
    }

    const response = await fetch(`${ODOO_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            jsonrpc: '2.0',
            params,
        }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse<T> = await response.json();

    if (data.error) {
        throw new Error(data.error.message || 'API Error');
    }

    if (!data.result) {
        throw new Error('No result in response');
    }

    return data.result;
};

/**
 * Login to Odoo
 */
export const loginToOdoo = async (
    email: string,
    password: string
): Promise<LoginResponse> => {
    try {
        const result = await makeRequest<LoginResponse>(
            ENDPOINTS.LOGIN,
            {
                login: email,
                password: password,
            },
            false
        );

        if (result.status === 'success' && result.session_id) {
            // Save session data to AsyncStorage
            await AsyncStorage.multiSet([
                [STORAGE_KEYS.SESSION_ID, result.session_id],
                [STORAGE_KEYS.USER_NAME, result.name || ''],
                [STORAGE_KEYS.USER_ID, result.uid?.toString() || ''],
                [STORAGE_KEYS.USER_EMAIL, email],
            ]);

            console.log('✅ Login successful:', result.name);
            return result;
        } else {
            throw new Error(result.message || 'Login failed');
        }
    } catch (error: any) {
        console.error('❌ Login error:', error.message);
        throw error;
    }
};

/**
 * Gets user information from the server
 */
export const getUserInfo = async (): Promise<any> => {
    return makeRequest<any>(ENDPOINTS.USER_INFO, {}, true);
};

/**
 * Logout - Clear all session data from AsyncStorage
 */
export const logout = async (): Promise<void> => {
    await AsyncStorage.multiRemove([
        STORAGE_KEYS.SESSION_ID,
        STORAGE_KEYS.USER_NAME,
        STORAGE_KEYS.USER_ID,
        STORAGE_KEYS.USER_EMAIL,
    ]);
    console.log('✅ Logged out successfully');
};

/**
 * Check if user is authenticated (has a session saved)
 */
export const isAuthenticated = async (): Promise<boolean> => {
    const sessionId = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_ID);
    return !!sessionId;
};

/**
 * Get saved session data
 */
export const getSessionData = async () => {
    const keys = [
        STORAGE_KEYS.SESSION_ID,
        STORAGE_KEYS.USER_NAME,
        STORAGE_KEYS.USER_ID,
        STORAGE_KEYS.USER_EMAIL,
    ];
    const result = await AsyncStorage.multiGet(keys);
    return {
        sessionId: result[0][1],
        userName: result[1][1],
        userId: result[2][1],
        userEmail: result[3][1],
    };
};
