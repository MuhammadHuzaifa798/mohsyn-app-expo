import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import {
    getTasks as fetchTasksFromApi,
    startTask as startTaskApi,
    stopTask as stopTaskApi,
    logExpense as logExpenseApi
} from '../utils/odooApi';

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
}

interface TaskContextType {
    tasks: Task[];
    startTask: (taskId: string) => Promise<void>;
    stopTask: (taskId: string, duration: number | string) => Promise<void>;
    logExpense: (taskId: string, notes: string, image?: string) => Promise<void>;
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

            // Map Odoo tasks to app Task interface
            const mappedTasks: Task[] = apiTasks.map((t: any) => {
                let statusColor = '#95A5A6'; // Default Gray
                const status = t.stage_name || 'New';

                if (status === 'In Progress') statusColor = '#E8832F'; // Orange
                if (status === 'Done' || status === 'Completed') statusColor = '#27AE60'; // Green

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

                return {
                    id: String(t.id),
                    title: t.name || 'Untitled Task',
                    company: t.partner_name || t.project_name || 'No Company',
                    location: t.partner_address ? t.partner_address.replace(/\n/g, ', ') : '',
                    date: formattedDate,
                    time: formattedTime,
                    status: status,
                    statusColor: statusColor,
                    description: t.description,
                    is_fsm: t.is_fsm,
                    // Use server-side start time if available for 'In Progress' tasks
                    startedAt: status === 'In Progress' ? (t.timer_start || tasks.find(p => p.id === String(t.id))?.startedAt || new Date().toISOString()) : undefined
                };
            });

            setTasks(mappedTasks);
        } catch (error) {
            console.error('Error refreshing tasks:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        refreshTasks();
    }, [refreshTasks]);

    const startTask = async (taskId: string) => {
        // Optimistic update
        setTasks(prevTasks => prevTasks.map(task =>
            task.id === taskId
                ? { ...task, status: 'In Progress', statusColor: '#E8832F', startedAt: new Date().toISOString() }
                : task
        ));

        try {
            const response = await startTaskApi(Number(taskId));
            if (response.status === 'error') {
                throw new Error(response.message || 'Failed to start task');
            }
            await refreshTasks();
        } catch (error: any) {
            console.error('Error starting task:', error);
            Alert.alert('Task Error', error.message || 'Could not start task on server');
            // Revert on error
            await refreshTasks();
            throw error;
        }
    };

    const stopTask = async (taskId: string, duration: number | string) => {
        // Optimistic update
        setTasks(prevTasks => prevTasks.map(task =>
            task.id === taskId
                ? { ...task, status: 'Done', statusColor: '#27AE60' }
                : task
        ));

        try {
            const response = await stopTaskApi(taskId, duration);
            if (response.status === 'error') {
                throw new Error(response.message || 'Failed to complete task');
            }
            await refreshTasks();
        } catch (error: any) {
            console.error('Error stopping task:', error);
            Alert.alert('Task Error', error.message || 'Could not complete task on server');
            // Revert on error
            await refreshTasks();
            throw error;
        }
    };

    const logExpense = async (taskId: string, notes: string, image?: string) => {
        try {
            await logExpenseApi(Number(taskId), notes, image);
        } catch (error) {
            console.error('Error logging expense:', error);
            throw error;
        }
    };

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
            console.error('Error updating task status on server:', error);
        }
    };

    return (
        <TaskContext.Provider value={{
            tasks,
            startTask,
            stopTask,
            logExpense,
            updateTaskStatus,
            refreshTasks,
            isLoading
        }}>
            {children}
        </TaskContext.Provider>
    );
};
