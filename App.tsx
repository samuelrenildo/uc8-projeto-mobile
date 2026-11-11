import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { AcervoProvedor } from './src/contexto/AcervoContexto';
import { PilhaAcervo } from './src/navegacao/PilhaAcervo';
import { TelaBusca } from './src/telas/TelaBusca';
import { TelaCadastroLeitor } from './src/telas/TelaCadastroLeitor';
import { TelaSobre } from './src/telas/TelaSobre';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <AcervoProvedor>
      <NavigationContainer>
        <StatusBar style="light" />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerStyle: { backgroundColor: '#2B1D14' },
            headerTintColor: '#F5ECD7',
            tabBarStyle: { backgroundColor: '#2B1D14', borderTopColor: '#5A4030' },
            tabBarActiveTintColor: '#D4AF37',
            tabBarInactiveTintColor: '#9C8670',
            tabBarIcon: ({ color, size }) => {
              let iconeName: keyof typeof Ionicons.glyphMap = 'book-outline';
              if (route.name === 'AcervoTab') iconeName = 'library-outline';
              else if (route.name === 'Busca') iconeName = 'search-outline';
              else if (route.name === 'CadastrarLeitor') iconeName = 'person-add-outline';
              else if (route.name === 'Sobre') iconeName = 'information-circle-outline';
              return <Ionicons name={iconeName} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="AcervoTab" component={PilhaAcervo} options={{ title: 'Acervo', headerShown: false }} />
          <Tab.Screen name="Busca" component={TelaBusca} options={{ title: 'Pesquisar Livros' }} />
          <Tab.Screen name="CadastrarLeitor" component={TelaCadastroLeitor} options={{ title: 'Novo Leitor' }} />
          <Tab.Screen name="Sobre" component={TelaSobre} options={{ title: 'Sobre o App' }} />
        </Tab.Navigator>
      </NavigationContainer>
    </AcervoProvedor>
  );
}