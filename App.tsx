import React, { useState } from 'react';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import MyTasksScreen from './src/screens/MyTasksScreen';
import TaskDetailScreen from './src/screens/TaskDetailScreen';
import TaskInProgressScreen from './src/screens/TaskInProgressScreen';
import LogExpensesScreen from './src/screens/LogExpensesScreen';
import ReimbursementScreen from './src/screens/ReimbursementScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import LocationPermissionScreen from './src/screens/LocationPermissionScreen';
import { StatusBar, PermissionsAndroid, Platform, View } from 'react-native';

type Screen = 'Login' | 'Dashboard' | 'MyTasks' | 'TaskDetail' | 'TaskInProgress' | 'LogExpenses' | 'Reimbursement' | 'Profile' | 'Calendar';

interface Task {
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

function App(): React.JSX.Element {
  const [currentScreen, setCurrentScreen] = useState<Screen>('Login');
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);

  React.useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        if (PermissionsAndroid) {
          const hasPermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
          setHasLocationPermission(hasPermission);
        } else {
          setHasLocationPermission(true);
        }
      } catch (err) {
        console.warn('Permission check error:', err);
        setHasLocationPermission(true); // Bypass if check fails to prevent crash
      }
    } else {
      setHasLocationPermission(true);
    }
  };

  if (hasLocationPermission === false) {
    return <LocationPermissionScreen onPermissionGranted={() => setHasLocationPermission(true)} />;
  }

  if (hasLocationPermission === null) {
    return <View style={{ flex: 1, backgroundColor: '#00231C' }} />; // Initial check in progress
  }

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  const navigateTo = (screen: Screen, taskId: string | null = null) => {
    if (taskId) setSelectedTaskId(taskId);
    setCurrentScreen(screen);
  };

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

  const handleLogout = () => {
    setCurrentScreen('Login');
  };

  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {currentScreen === 'Login' && (
        <LoginScreen onLogin={() => navigateTo('Dashboard')} />
      )}

      {currentScreen === 'Dashboard' && (
        <DashboardScreen
          tasks={tasks}
          onStartTask={() => navigateTo('MyTasks')}
          onLogExpenses={() => navigateTo('LogExpenses')}
          onProfile={() => navigateTo('Profile')}
          onTasks={() => navigateTo('MyTasks')}
          onCalendar={() => navigateTo('Calendar')}
          onTaskPress={(task) => {
            if (task.status === 'In Progress') {
              navigateTo('TaskInProgress', task.id);
            } else {
              navigateTo('TaskDetail', task.id);
            }
          }}
        />
      )}

      {currentScreen === 'MyTasks' && (
        <MyTasksScreen
          tasks={tasks}
          onTaskPress={(task) => navigateTo('TaskDetail', task.id)}
          onBack={() => navigateTo('Dashboard')}
          onProfile={() => navigateTo('Profile')}
          onDashboard={() => navigateTo('Dashboard')}
          onLogExpenses={() => navigateTo('LogExpenses')}
          onCalendar={() => navigateTo('Calendar')}
        />
      )}

      {currentScreen === 'Calendar' && (
        <CalendarScreen
          tasks={tasks}
          onTaskPress={(task) => navigateTo('TaskDetail', task.id)}
          onBack={() => navigateTo('Dashboard')}
          onDashboard={() => navigateTo('Dashboard')}
          onTasks={() => navigateTo('MyTasks')}
          onProfile={() => navigateTo('Profile')}
        />
      )}

      {currentScreen === 'TaskDetail' && (
        <TaskDetailScreen
          task={selectedTask}
          onBack={() => navigateTo('MyTasks')}
          onInProgress={() => {
            if (selectedTaskId) updateTaskStatus(selectedTaskId, 'In Progress');
            navigateTo('TaskInProgress', selectedTaskId);
          }}
        />
      )}

      {currentScreen === 'TaskInProgress' && (
        <TaskInProgressScreen
          task={selectedTask}
          onBack={() => navigateTo('TaskDetail')}
          onComplete={() => {
            if (selectedTaskId) updateTaskStatus(selectedTaskId, 'Done');
            navigateTo('MyTasks');
          }}
          onDashboard={() => navigateTo('Dashboard')}
          onLogExpenses={() => navigateTo('LogExpenses')}
          onProfile={() => navigateTo('Profile')}
          onCalendar={() => navigateTo('Calendar')}
        />
      )}

      {currentScreen === 'LogExpenses' && (
        <LogExpensesScreen
          onBack={() => navigateTo('Dashboard')}
          onSubmit={() => navigateTo('Reimbursement')}
          onDashboard={() => navigateTo('Dashboard')}
          onTasks={() => navigateTo('MyTasks')}
          onProfile={() => navigateTo('Profile')}
        />
      )}

      {currentScreen === 'Reimbursement' && (
        <ReimbursementScreen
          onBack={() => navigateTo('LogExpenses')}
          onSubmit={() => navigateTo('Dashboard')}
        />
      )}

      {currentScreen === 'Profile' && (
        <ProfileScreen
          onBack={() => navigateTo('Dashboard')}
          onLogout={handleLogout}
          onTasks={() => navigateTo('MyTasks')}
          onLogExpenses={() => navigateTo('LogExpenses')}
          onCalendar={() => navigateTo('Calendar')}
        />
      )}
    </>
  );
}

export default App;
