/**
 * Odoo API Service
 * Handles all API communication with the Odoo backend
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// ⚠️ CONFIGURATION - UPDATE THIS VALUE ⚠️
// ============================================
export const ODOO_URL = process.env.EXPO_PUBLIC_ODOO_URL || 'http://192.168.100.53:8019';

// API Endpoints
const ENDPOINTS = {
    LOGIN: '/prodo/api/login',
    USER_INFO: '/prodo/api/user_info',
    TASKS: '/prodo/api/tasks',
    TASK_START: '/prodo/api/task/start',
    TASK_STOP: '/prodo/api/task/stop',
    TASK_HOLD: '/prodo/api/task/hold',
    TASK_LOG_EXPENSE: '/prodo/api/task/log_expense',
    TASK_MESSAGES: '/prodo/api/task/messages',
    RESET_PASSWORD: '/prodo/api/reset_password',
    CHATAUDIO: '/prodo/api/chatter/audio',
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
        console.log('❌ Login error:', error.message);
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
 * Fetch tasks for the current user
 */
export const getTasks = async (): Promise<any[]> => {
    try {
        const response: any = await makeRequest<any>(ENDPOINTS.TASKS, {}, true);
        if (response.status === 'success' && Array.isArray(response.data)) {
            return response.data;
        }
        return [];
    } catch (error) {
        console.log('Get Tasks Error:', error);
        return [];
    }
};

/**
 * Start a task (Timer + Stage update)
 */
export const startTask = async (taskId: number): Promise<any> => {
    try {
        return await makeRequest<any>(ENDPOINTS.TASK_START, { task_id: taskId }, true);
    } catch (error: any) {
        console.log('Start Task Error:', error.message);
        throw error;
    }
};

/**
 * Stop a task (Timer + Timesheet)
 */
export const stopTask = async (taskId: number | string, duration: number | string): Promise<any> => {
    try {
        return await makeRequest<any>(
            ENDPOINTS.TASK_STOP,
            { task_id: Number(taskId), duration: duration },
            true
        );
    } catch (error: any) {
        console.log('Stop Task Error:', error.message);
        throw error;
    }
};

/**
 * Hold a task (Pause Timer + Stage update)
 */
export const holdTask = async (taskId: number | string, duration: number | string): Promise<any> => {
    try {
        return await makeRequest<any>(
            ENDPOINTS.TASK_HOLD,
            { task_id: Number(taskId), duration: duration },
            true
        );
    } catch (error: any) {
        console.log('Hold Task Error:', error.message);
        throw error;
    }
};

/**
 * Log an expense note and image to a task
 */
export const logExpense = async (
    taskId: number,
    notes?: string,
    image?: string
): Promise<any> => {
    try {
        return await makeRequest<any>(
            ENDPOINTS.TASK_LOG_EXPENSE,
            {
                task_id: taskId,
                notes: notes,
                image: image, // Base64 string
            },
            true
        );
    } catch (error: any) {
        console.log('Log Expense Error:', error.message);
        throw error;
    }
};

/**
 * Fetch messages for a task
 */
export const fetchTaskMessages = async (taskId: number): Promise<any[]> => {
    try {
        const response: any = await makeRequest<any>(
            ENDPOINTS.TASK_MESSAGES,
            { task_id: taskId },
            true
        );
        if (response.status === 'success' && Array.isArray(response.data)) {
            return response.data;
        }
        return [];
    } catch (error: any) {
        console.log('Fetch Messages Error:', error.message);
        return [];
    }
};

/**
 * Post a message to a task
 */
export const postTaskMessage = async (taskId: number, message: string): Promise<any> => {
    try {
        return await makeRequest<any>(
            ENDPOINTS.TASK_MESSAGES,
            { task_id: taskId, message: message },
            true
        );
    } catch (error: any) {
        console.log('Post Message Error:', error.message);
        throw error;
    }
};

/**
 * Upload audio to chatter
 */
export const uploadAudioToChatter = async (
    model: string,
    resId: number,
    audio: string,
    fileName: string = 'voice_note.mp3'
): Promise<any> => {
    try {
        return await makeRequest<any>(
            ENDPOINTS.CHATAUDIO,
            {
                model: model,
                res_id: resId,
                audio: audio, // Base64 string
                file_name: fileName,
            },
            true
        );
    } catch (error: any) {
        console.log('Upload Audio Error:', error.message);
        throw error;
    }
};

/**
 * Reset Password
 */
export const resetPassword = async (login: string): Promise<any> => {
    try {
        return await makeRequest<any>(
            ENDPOINTS.RESET_PASSWORD,
            { login: login },
            false
        );
    } catch (error: any) {
        console.log('Reset Password Error:', error.message);
        throw error;
    }
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
