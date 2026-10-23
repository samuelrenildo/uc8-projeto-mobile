import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Botao } from '../componentes/Botao';
import { CartaoLivro } from '../componentes/CartaoLivro';
import type { RotasDaPilha } from '../navegacao/tipos';
import { carregarLivros } from '../servicos/acervo';
import { cores, espacos, larguraMaxima } from '../tema/tema';
import type { Livro } from '../types/entidades';

type TelaAcervoProps = NativeStackScreenProps<RotasDaPilha, 'Acervo'>;

export function TelaAcervo({ navigation }: TelaAcervoProps) {
  const [livros, setLivros] = useState<Livro[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [tentativa, setTentativa] = useState(0);
  const { width } = useWindowDimensions();
  const duasColunas = width >= larguraMaxima;

  useFocusEffect(
    useCallback(() => {
      let cancelado = false;
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

  function recarregar() {
    setCarregando(true);
    setTentativa(tentativa + 1);
  }

  return (
    <View style={estilos.tela}>
      <View style={estilos.barra}>
        <Botao titulo="Recarregar" variante="secundario" onPress={recarregar} />
        <Botao titulo="Novo livro" onPress={() => navigation.navigate('NovoLivro')} />
      </View>
      {carregando ? (
        <View style={estilos.centro}>
          <ActivityIndicator size="large" />
          <Text>Carregando o acervo...</Text>
        </View>
      ) : (
        <FlatList
          key={duasColunas ? 'duas' : 'uma'}
          data={livros}
          numColumns={duasColunas ? 2 : 1}
          columnWrapperStyle={duasColunas ? estilos.linhaDeColunas : undefined}
          keyExtractor={(livro) => String(livro.id)}
          renderItem={({ item }) => (
            <View style={estilos.celula}>
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
  tela: { flex: 1, backgroundColor: cores.fundo, padding: espacos.md },
  barra: { flexDirection: 'row', gap: espacos.sm, marginBottom: espacos.md },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  linhaDeColunas: { gap: espacos.sm },
  celula: { flex: 1 },
  detalhes: { color: cores.primario, fontWeight: 'bold', marginBottom: espacos.md },
});