import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import {
    getTasks as fetchTasksFromApi,
    startTask as startTaskApi,
    stopTask as stopTaskApi,
    holdTask as holdTaskApi,
    logExpense as logExpenseApi,
    fetchTaskMessages,
    postTaskMessage,
    uploadAudioToChatter
} from '../utils/odooApi';
import { showToast } from '../utils/toast';
import { stripHtml } from '../utils/textHelpers';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const durationToHours = (duration: string | number): number => {
    if (typeof duration === 'number') return duration;
    if (!duration || typeof duration !== 'string' || !duration.includes(':')) return parseFloat(String(duration)) || 0;
    const parts = duration.split(':');
    const h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    const s = parseInt(parts[2], 10) || 0;
    return h + (m / 60) + (s / 3600);
};

export interface Task {
    id: string;
    title: string;
    company: string;
    location?: string;
    time?: string;
    date: string;
    status: string;
    statusColor: string;
    startedAt?: string;
    description?: string;
    is_fsm?: boolean;
    effective_hours?: number;
}

interface TaskContextType {
    tasks: Task[];
    startTask: (taskId: string) => Promise<void>;
    stopTask: (taskId: string, duration: number | string) => Promise<void>;
    holdTask: (taskId: string, duration: number | string) => Promise<void>;
    logExpense: (taskId: string, notes: string, image?: string) => Promise<void>;
    getMessages: (taskId: string) => Promise<any[]>;
    sendMessage: (taskId: string, message: string) => Promise<void>;
    sendAudioMessage: (taskId: string, audioBase64: string, fileName?: string) => Promise<void>;
    updateTaskStatus: (taskId: string, newStatus: string) => Promise<void>;
    refreshTasks: () => Promise<void>;
    isLoading: boolean;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTasks = () => {
    const context = useContext(TaskContext);
    if (!context) throw new Error('useTasks must be used within a TaskProvider');
    return context;
};

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const refreshTasks = useCallback(async () => {
        setIsLoading(true);
        try {
            const apiTasks = await fetchTasksFromApi();

            setTasks(prevTasks => apiTasks.map((t: any) => {
                const rawStatus = (t.stage_name || '').toLowerCase().trim();
                let status = 'To Do';
                let statusColor = '#95A5A6';

                // Normalize Status with broad matching
                if (rawStatus.includes('progress') || rawStatus === 'started' || rawStatus === 'running') {
                    status = 'In Progress';
                    statusColor = '#E8832F';
                } else if (rawStatus.includes('hold') || rawStatus.includes('pause') || rawStatus === 'waiting') {
                    status = 'On Hold';
                    statusColor = '#95A5A6';
                } else if (rawStatus.includes('approval') || rawStatus.includes('pending')) {
                    status = 'Approval';
                    statusColor = '#3498DB';
                } else if (rawStatus.includes('done') || rawStatus.includes('complete') || rawStatus.includes('finish')) {
                    status = 'Done';
                    statusColor = '#27AE60';
                }

                // Parse date if available
                let formattedDate = '';
                let formattedTime = '';

                if (t.date_deadline) {
                    const dateObj = new Date(t.date_deadline);
                    formattedDate = dateObj.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    });
                    formattedTime = dateObj.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                    });
                }

                const existingTask = prevTasks.find(p => String(p.id) === String(t.id));

                return {
                    id: String(t.id),
                    title: t.name || 'Untitled Task',
                    company: t.partner_name || t.project_name || 'No Company',
                    location: t.partner_address ? t.partner_address.replace(/\n/g, ', ') : '',
                    date: formattedDate,
                    time: formattedTime,
                    status: status,
                    statusColor: statusColor,
                    description: stripHtml(t.description),
                    is_fsm: t.is_fsm,
                    // Stability: Never let effective_hours go down during a session
                    effective_hours: Math.max(t.effective_hours || 0, existingTask?.effective_hours || 0),
                    // Use server-side start time if available for 'In Progress' tasks
                    startedAt: status === 'In Progress' ? (t.timer_start || existingTask?.startedAt || new Date().toISOString()) : undefined
                };
            }));
        } catch (error) {
            console.log('Error refreshing tasks:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        refreshTasks();
    }, [refreshTasks]);

    const startTask = async (taskId: string) => {
        // Optimistic update: Move to In Progress and set startedAt to now
        // We keep the current effective_hours as the base
        setTasks(prevTasks => prevTasks.map(task =>
            task.id === taskId
                ? {
                    ...task,
                    status: 'In Progress',
                    statusColor: '#E8832F',
                    startedAt: new Date().toISOString()
                }
                : task
        ));

        try {
            const response = await startTaskApi(Number(taskId));
            if (response.status === 'error') {
                throw new Error(response.message || 'Failed to start task');
            }
            await wait(800);
            await refreshTasks();
        } catch (error: any) {
            console.log('Error starting task:', error);
            showToast.error('Task Error', error.message || 'Could not start task on server');
            // Revert on error
            await refreshTasks();
            throw error;
        }
    };

    const stopTask = async (taskId: string, duration: number | string) => {
        // Optimistic update: Now goes to Approval instead of Done
        setTasks(prevTasks => prevTasks.map(task =>
            task.id === taskId
                ? { ...task, status: 'Approval', statusColor: '#3498DB' }
                : task
        ));

        try {
            const response = await stopTaskApi(taskId, duration);
            if (response.status === 'error') {
                throw new Error(response.message || 'Failed to complete task');
            }
            await wait(800);
            await refreshTasks();
        } catch (error: any) {
            console.log('Error stopping task:', error);
            showToast.error('Task Error', error.message || 'Could not complete task on server');
            // Revert on error
            await refreshTasks();
            throw error;
        }
    };

    const holdTask = async (taskId: string, duration: number | string) => {
        const hours = durationToHours(duration);

        // Optimistic update: Set status to On Hold and update effective_hours to the duration we just logged
        setTasks(prevTasks => prevTasks.map(task =>
            task.id === taskId
                ? {
                    ...task,
                    status: 'On Hold',
                    statusColor: '#95A5A6',
                    effective_hours: hours,
                    startedAt: undefined
                }
                : task
        ));

        try {
            const response = await holdTaskApi(taskId, duration);
            if (response.status === 'error') {
                throw new Error(response.message || 'Failed to hold task');
            }
            await wait(800);
            await refreshTasks();
        } catch (error: any) {
            console.log('Error holding task:', error);
            showToast.error('Task Error', error.message || 'Could not hold task on server');
            await refreshTasks();
            throw error;
        }
    };

    const logExpense = async (taskId: string, notes: string, image?: string) => {
        try {
            await logExpenseApi(Number(taskId), notes, image);
        } catch (error) {
            console.log('Error logging expense:', error);
            throw error;
        }
    };

    const getMessages = async (taskId: string) => {
        try {
            const msgs = await fetchTaskMessages(Number(taskId));
            // Normalize and sort messages
            return msgs.map((msg: any) => ({
                ...msg,
                // Ensure body_text is available
                body_text: msg.body_text || msg.body || '',
                // Consolidate any attachment fields
                attachments: msg.attachments || msg.attachment_ids || msg.attachment_info || msg.message_attachments || [],
            })).sort((a: any, b: any) =>
                new Date(a.date).getTime() - new Date(b.date).getTime()
            );
        } catch (error) {
            console.log('Error fetching messages:', error);
            return [];
        }
    };

    const sendMessage = async (taskId: string, message: string) => {
        try {
            await postTaskMessage(Number(taskId), message);
        } catch (error) {
            console.log('Error sending message:', error);
            throw error;
        }
    };

    const sendAudioMessage = async (taskId: string, audioBase64: string, fileName: string = 'voice_note.mp3') => {
        try {
            // Usually chatter messages in Odoo for FSM are attached to 'project.task'
            await uploadAudioToChatter('project.task', Number(taskId), audioBase64, fileName);
        } catch (error) {
            console.log('Error sending audio message:', error);
            throw error;
        }
    };

    // Functions removed to fix duplication


    const updateTaskStatus = async (taskId: string, newStatus: string) => {
        // Optimistic update
        setTasks(prevTasks => prevTasks.map(task => {
            if (task.id === taskId) {
                let color = '#95A5A6';
                let startedAt = task.startedAt;

                if (newStatus === 'In Progress') {
                    color = '#E8832F';
                    if (!startedAt) startedAt = new Date().toISOString();
                }
                if (newStatus === 'Done') color = '#27AE60';

                return { ...task, status: newStatus, statusColor: color, startedAt };
            }
            return task;
        }));

        // Handle specific status transitions with dedicated API calls
        try {
            if (newStatus === 'In Progress') {
                await startTaskApi(Number(taskId));
            } else if (newStatus === 'Done') {
                // For 'Done', we usually need a duration. 
                // Since this is a generic update, we'll use 0 or let stopTask handle it.
                // It's better to use stopTask directly from the UI when completing.
                await stopTaskApi(Number(taskId), 0);
            }
            await refreshTasks();
        } catch (error) {
            console.log('Error updating task status on server:', error);
        }
    };

    return (
        <TaskContext.Provider value={{
            tasks,
            startTask,
            stopTask,
            holdTask,
            logExpense,
            getMessages,
            sendMessage,
            sendAudioMessage,
            updateTaskStatus,
            refreshTasks,
            isLoading
        }}>
            {children}
        </TaskContext.Provider>
    );
};
