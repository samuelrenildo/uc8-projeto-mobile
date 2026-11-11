import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TelaAcervo } from '../telas/TelaAcervo';
import { TelaDetalhesLivro } from '../telas/TelaDetalheLivro';
import { TelaNovoLivro } from '../telas/TelaNovoLivro';
import type { RotasDaPilha } from './tipos';

const Pilha = createNativeStackNavigator<RotasDaPilha>();

export function PilhaAcervo() {
  return (
    <Pilha.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#2B1D14' },
        headerTintColor: '#F5ECD7',
      }}
    >
      <Pilha.Screen name="Acervo" component={TelaAcervo} options={{ title: 'Acervo' }} />
      <Pilha.Screen name="DetalheLivro" component={TelaDetalhesLivro} options={{ title: 'Detalhe do Livro' }} />
      <Pilha.Screen name="TelaNovoLivro" component={TelaNovoLivro} options={{ title: 'Novo Livro' }} />
    </Pilha.Navigator>
  );
}