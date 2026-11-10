import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { AcervoProvedor } from './src/contexto/AcervoContexto';
import { PilhaAcervo } from './src/navegacao/PilhaAcervo';
import { TelaBusca } from './src/telas/TelaBusca';
import { TelaCadastroLeitor } from './src/telas/TelaCadastroLeitor';
import { TelaSobre } from './src/telas/TelaSobre';

// Tipagem estrita de todas as abas principais da aplicação
type RotasAbas = {
  AcervoTab: undefined;
  Busca: undefined;
  CadastrarLeitor: undefined;
  Sobre: undefined;
};

const Tab = createBottomTabNavigator<RotasAbas>();

export default function App() {
  return (
    <AcervoProvedor>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerStyle: { backgroundColor: '#13182C' },
            headerTintColor: '#FFFFFF',
            tabBarStyle: { backgroundColor: '#13182C', borderTopColor: '#2A3456' },
            tabBarActiveTintColor: '#3B82F6',
            tabBarInactiveTintColor: '#64748B',
            tabBarIcon: ({ color, size }: { color: string; size: number }) => {
              let iconeName: keyof typeof Ionicons.glyphMap = 'book-outline';

              if (route.name === 'AcervoTab') {
                iconeName = 'library-outline';
              } else if (route.name === 'Busca') {
                iconeName = 'search-outline';
              } else if (route.name === 'CadastrarLeitor') {
                iconeName = 'person-add-outline';
              } else if (route.name === 'Sobre') {
                iconeName = 'information-circle-outline';
              }

              return <Ionicons name={iconeName} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen 
            name="AcervoTab" 
            component={PilhaAcervo} 
            options={{ title: 'Acervo', headerShown: false }} 
          />
          <Tab.Screen 
            name="Busca" 
            component={TelaBusca} 
            options={{ title: 'Pesquisar Livros' }} 
          />
          <Tab.Screen 
            name="CadastrarLeitor" 
            component={TelaCadastroLeitor} 
            options={{ title: 'Novo Leitor' }} 
          />
          <Tab.Screen 
            name="Sobre" 
            component={TelaSobre} 
            options={{ title: 'Sobre o App' }} 
          />
        </Tab.Navigator>
      </NavigationContainer>
    </AcervoProvedor>
  );
}