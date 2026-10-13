import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TelaAcervo } from '../telas/TelaAcervo';
import { TelaDetalheLivro } from '../telas/TelaDetalheLivro';
import type { RotasDaPilha } from './tipos';

const Pilha = createNativeStackNavigator<RotasDaPilha>();

export function PilhaAcervo() {
  return (
    <Pilha.Navigator>
      <Pilha.Screen name="Acervo" component={TelaAcervo} />
      <Pilha.Screen name="DetalheLivro" component={TelaDetalheLivro} options={{ title: 'Detalhe do livro' }} />
    </Pilha.Navigator>
  );
}