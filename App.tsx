import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RotasDaPilha } from './src/navegacao/tipos';
import { TelaAcervo } from './src/telas/TelaAcervo';

const Pilha = createNativeStackNavigator<RotasDaPilha>();

export default function App() {
  return (
    <NavigationContainer>
      <Pilha.Navigator>
        <Pilha.Screen name="Acervo" component={TelaAcervo} />
      </Pilha.Navigator>
    </NavigationContainer>
  );
}