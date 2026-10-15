import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CartaoLivro } from '../componentes/CartaoLivro';
import type { RotasDaPilha } from '../navegacao/tipos';
import { carregarLivros } from '../servicos/acervo';
import type { Livro } from '../types/entidades';

type TelaAcervoProps = NativeStackScreenProps<RotasDaPilha, 'Acervo'>;

export function TelaAcervo({ navigation }: TelaAcervoProps) {
  const [livros, setLivros] = useState<Livro[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [tentativa, setTentativa] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let cancelado = false;
      setCarregando(true);
      carregarLivros().then((resultado) => {
        if (cancelado) {
          return;
        }
        setLivros(resultado);
        setCarregando(false);
      });
      return () => {
        cancelado = true;
      };
    }, [tentativa]),
  );

  return (
    <View style={estilos.tela}>
      <View style={estilos.linhaBotoes}>
        <Pressable style={estilos.botao} onPress={() => setTentativa(tentativa + 1)}>
          <Text style={estilos.textoBotao}>Recarregar</Text>
        </Pressable>
        <Pressable style={estilos.botao} onPress={() => navigation.navigate('NovoLivro')}>
          <Text style={estilos.textoBotao}>Novo livro</Text>
        </Pressable>
      </View>
      {carregando ? (
        <View style={estilos.centro}>
          <ActivityIndicator size="large" />
          <Text>Carregando o acervo...</Text>
        </View>
      ) : (
        <FlatList
          data={livros}
          keyExtractor={(livro) => String(livro.id)}
          renderItem={({ item }) => (
            <View>
              <CartaoLivro livro={item} />
              <Pressable onPress={() => navigation.navigate('DetalheLivro', { id: item.id })}>
                <Text style={estilos.detalhes}>Ver detalhes</Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={<Text>Nenhum livro no acervo.</Text>}
        />
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#F6F8FA', padding: 16 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  linhaBotoes: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  botao: { flex: 1, backgroundColor: '#004A8D', borderRadius: 6, padding: 12, alignItems: 'center' },
  textoBotao: { color: '#fff', fontWeight: 'bold' },
  detalhes: { color: '#004A8D', fontWeight: 'bold', marginBottom: 16 },
});