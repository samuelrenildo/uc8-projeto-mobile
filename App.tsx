import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RotasDaPilha } from './src/navegacao/tipos';
import { TelaAcervo } from './src/telas/TelaAcervo';
import { TelaDetalheLivro } from './src/telas/TelaDetalheLivro';

const Pilha = createNativeStackNavigator<RotasDaPilha>();

export default function App() {
  return (
    <NavigationContainer>
      <Pilha.Navigator>
        <Pilha.Screen name="Acervo" component={TelaAcervo} />
        <Pilha.Screen name="DetalheLivro" component={TelaDetalheLivro} options={{ title: 'Detalhe do livro' }} />
      </Pilha.Navigator>
    </NavigationContainer>
  );
}