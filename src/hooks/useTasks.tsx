import React, { createContext, useContext, useState } from 'react';

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
}

interface TaskContextType {
    tasks: Task[];
    updateTaskStatus: (taskId: string, newStatus: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTasks = () => {
    const context = useContext(TaskContext);
    if (!context) throw new Error('useTasks must be used within a TaskProvider');
    return context;
};

const initialTasks: Task[] = [
    {
        id: '1',
        title: 'AC Inspection',
        company: 'ABC Company',
        location: 'Sector 12, Karachi',
        date: 'Apr 25, 2024',
        status: 'To Do',
        statusColor: '#95A5A6',
    },
    {
        id: '4',
        title: 'Emergency Repair',
        company: 'Downtown Mall',
        location: 'Main St, Karachi',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'To Do',
        statusColor: '#95A5A6',
    },
    {
        id: '2',
        title: 'Power Line Check',
        company: 'Ade Baseem',
        time: '8:30am - 8:30pm',
        date: 'Apr 26, 2024',
        status: 'To Do',
        statusColor: '#95A5A6',
    },
    {
        id: '3',
        title: 'Network Setup',
        company: 'Willowmore',
        time: '7:30pm - 6:30pm',
        date: 'Apr 27, 2024',
        status: 'In Progress',
        statusColor: '#E8832F',
        startedAt: new Date().toISOString(),
    },
];

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tasks, setTasks] = useState(initialTasks);

    const updateTaskStatus = (taskId: string, newStatus: string) => {
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
    };

    return (
        <TaskContext.Provider value={{ tasks, updateTaskStatus }}>
            {children}
        </TaskContext.Provider>
    );
};
