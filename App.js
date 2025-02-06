// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { Icon } from 'react-native-elements';

// Telas de Autenticação
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';

// Telas Principais
import DashboardScreen from './src/screens/main/DashboardScreen';
import StockControlScreen from './src/screens/stock/StockControlScreen';
import RefuelingScreen from './src/screens/refueling/RefuelingScreen';
import MaintenanceScreen from './src/screens/maintenance/MaintenanceScreen';
import ChecklistScreen from './src/screens/checklist/ChecklistScreen';
import SettingsScreen from './src/screens/settings/SettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Navegação principal com tabs
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'Estoque':
              iconName = 'local-gas-station';
              break;
            case 'Abastecimento':
              iconName = 'local-shipping';
              break;
            case 'Manutenção':
              iconName = 'build';
              break;
            case 'Checklist':
              iconName = 'check-box';
              break;
            case 'Configurações':
              iconName = 'settings';
              break;
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Estoque" component={StockControlScreen} />
      <Tab.Screen name="Abastecimento" component={RefuelingScreen} />
      <Tab.Screen name="Manutenção" component={MaintenanceScreen} />
      <Tab.Screen name="Checklist" component={ChecklistScreen} />
      <Tab.Screen name="Configurações" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="MainApp" 
            component={MainTabs} 
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}