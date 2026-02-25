import React, { useState, useEffect } from 'react';
import { StatusBar, View } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Location from 'expo-location';
import { Colors } from './src/theme';

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

import { TaskProvider, useTasks } from './src/hooks/useTasks';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  MyTasks: undefined;
  Calendar: undefined;
  TaskDetail: { taskId: string };
  TaskInProgress: { taskId: string };
  LogExpenses: { taskId?: string };
  Reimbursement: { amount: string };
  Profile: undefined;
  LocationPermission: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

function Navigation() {
  const { tasks, updateTaskStatus, startTask, stopTask, refreshTasks, isLoading } = useTasks();
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    setHasLocationPermission(status === 'granted');
  };

  if (hasLocationPermission === null) {
    return <View style={{ flex: 1, backgroundColor: '#00231C' }} />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {!hasLocationPermission ? (
        <Stack.Screen name="LocationPermission">
          {(props) => (
            <LocationPermissionScreen
              onPermissionGranted={() => setHasLocationPermission(true)}
            />
          )}
        </Stack.Screen>
      ) : (
        <>
          <Stack.Screen name="Login">
            {(props) => <LoginScreen onLogin={() => props.navigation.navigate('Dashboard')} />}
          </Stack.Screen>

          <Stack.Screen name="Dashboard">
            {(props) => (
              <DashboardScreen
                tasks={tasks}
                onStartTask={() => props.navigation.navigate('MyTasks')}
                onLogExpenses={() => props.navigation.navigate('LogExpenses', {})}
                onProfile={() => props.navigation.navigate('Profile')}
                onTasks={() => props.navigation.navigate('MyTasks')}
                onCalendar={() => props.navigation.navigate('Calendar')}
                onTaskPress={(task) => {
                  if (task.status === 'In Progress') {
                    props.navigation.navigate('TaskInProgress', { taskId: task.id });
                  } else {
                    props.navigation.navigate('TaskDetail', { taskId: task.id });
                  }
                }}
                onRefresh={refreshTasks}
                isLoading={isLoading}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="MyTasks">
            {(props) => (
              <MyTasksScreen
                tasks={tasks}
                onTaskPress={(task) => {
                  if (task.status === 'In Progress') {
                    props.navigation.navigate('TaskInProgress', { taskId: task.id });
                  } else {
                    props.navigation.navigate('TaskDetail', { taskId: task.id });
                  }
                }}
                onBack={() => props.navigation.goBack()}
                onProfile={() => props.navigation.navigate('Profile')}
                onDashboard={() => props.navigation.navigate('Dashboard')}
                onLogExpenses={() => props.navigation.navigate('LogExpenses', {})}
                onCalendar={() => props.navigation.navigate('Calendar')}
                onRefresh={refreshTasks}
                isLoading={isLoading}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="Calendar">
            {(props) => (
              <CalendarScreen
                tasks={tasks}
                onTaskPress={(task) => {
                  if (task.status === 'In Progress') {
                    props.navigation.navigate('TaskInProgress', { taskId: task.id });
                  } else {
                    props.navigation.navigate('TaskDetail', { taskId: task.id });
                  }
                }}
                onBack={() => props.navigation.goBack()}
                onDashboard={() => props.navigation.navigate('Dashboard')}
                onTasks={() => props.navigation.navigate('MyTasks')}
                onProfile={() => props.navigation.navigate('Profile')}
                onRefresh={refreshTasks}
                isLoading={isLoading}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="TaskDetail">
            {(props) => {
              const taskId = props.route.params.taskId;
              const task = tasks.find(t => String(t.id) === String(taskId));

              return (
                <TaskDetailScreen
                  task={task}
                  onBack={() => props.navigation.goBack()}
                  onInProgress={async () => {
                    // Only call startTask if it's not already in progress
                    if (task?.status !== 'In Progress') {
                      await startTask(taskId);
                    }
                    props.navigation.navigate('TaskInProgress', { taskId: taskId });
                  }}
                />
              );
            }}
          </Stack.Screen>

          <Stack.Screen name="TaskInProgress">
            {(props) => {
              const taskId = props.route.params.taskId;
              const task = tasks.find(t => String(t.id) === String(taskId));

              if (!task) return <View style={{ flex: 1, backgroundColor: Colors.background }} />;

              return (
                <TaskInProgressScreen
                  task={task}
                  onBack={() => props.navigation.navigate('MyTasks')}
                  onComplete={async (duration) => {
                    await stopTask(taskId, duration);
                    props.navigation.navigate('MyTasks');
                  }}
                  onDashboard={() => props.navigation.navigate('Dashboard')}
                  onLogExpenses={() => props.navigation.navigate('LogExpenses', { taskId: taskId })}
                  onProfile={() => props.navigation.navigate('Profile')}
                  onCalendar={() => props.navigation.navigate('Calendar')}
                />
              );
            }}
          </Stack.Screen>

          <Stack.Screen name="LogExpenses">
            {(props) => {
              const { logExpense } = useTasks();
              const taskId = props.route.params?.taskId;

              return (
                <LogExpensesScreen
                  taskId={taskId}
                  onBack={() => props.navigation.goBack()}
                  onSubmit={async (amount, notes, image) => {
                    if (taskId) {
                      await logExpense(taskId, notes || `Expense amount: ${amount}`, image);
                    }
                    props.navigation.navigate('Reimbursement', { amount });
                  }}
                  onDashboard={() => props.navigation.navigate('Dashboard')}
                  onTasks={() => props.navigation.navigate('MyTasks')}
                  onProfile={() => props.navigation.navigate('Profile')}
                />
              );
            }}
          </Stack.Screen>

          <Stack.Screen name="Reimbursement">
            {(props) => (
              <ReimbursementScreen
                amount={props.route.params.amount}
                onBack={() => props.navigation.goBack()}
                onSubmit={() => props.navigation.navigate('Dashboard')}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="Profile">
            {(props) => (
              <ProfileScreen
                onBack={() => props.navigation.goBack()}
                onLogout={() => props.navigation.replace('Login')}
                onTasks={() => props.navigation.navigate('MyTasks')}
                onLogExpenses={() => props.navigation.navigate('LogExpenses', {})}
                onCalendar={() => props.navigation.navigate('Calendar')}
              />
            )}
          </Stack.Screen>
        </>
      )}
    </Stack.Navigator>
  );
}

import Toast, { BaseToast, ErrorToast, SuccessToast } from 'react-native-toast-message';

const toastConfig = {
  success: (props: any) => (
    <SuccessToast
      {...props}
      style={{ borderLeftColor: Colors.completed, backgroundColor: '#052D25' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600',
        color: Colors.white
      }}
      text2Style={{
        fontSize: 14,
        color: Colors.textGray
      }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: '#FF5252', backgroundColor: '#052D25' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600',
        color: Colors.white
      }}
      text2Style={{
        fontSize: 14,
        color: Colors.textGray
      }}
    />
  ),
  info: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: Colors.heritageGold, backgroundColor: '#052D25' }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600',
        color: Colors.white
      }}
      text2Style={{
        fontSize: 14,
        color: Colors.textGray
      }}
    />
  ),
};

export default function App() {
  return (
    <SafeAreaProvider>
      <TaskProvider>
        <NavigationContainer>
          <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
          <Navigation />
        </NavigationContainer>
        <Toast config={toastConfig} />
      </TaskProvider>
    </SafeAreaProvider>
  );
}
