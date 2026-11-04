import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAcervo } from '../contexto/AcervoContexto';
import type { RotasDaPilha } from '../navegacao/tipos';

type TelaDetalheLivroProps = NativeStackScreenProps<RotasDaPilha, 'DetalheLivro'>;

export function TelaDetalheLivro({ route }: TelaDetalheLivroProps) {
  const { id } = route.params;
  const { buscar } = useAcervo();
  const livro = buscar(id);

  if (livro === undefined) {
    return (
      <View style={estilos.centro}>
        <Text>Livro não encontrado.</Text>
      </View>
    );
  }

  return (
    <View style={estilos.tela}>
      <Text style={estilos.titulo}>{livro.titulo}</Text>
      <Text style={estilos.autor}>{livro.autor}</Text>
      <Text style={estilos.sinopse}>{livro.sinopse ?? 'Sem sinopse'}</Text>
      <Text>{livro.exemplares} exemplares</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#F6F8FA', padding: 16 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  titulo: { fontSize: 24, fontWeight: 'bold' },
  autor: { color: '#5B6B7C', marginBottom: 16 },
  sinopse: { marginBottom: 16 },
});