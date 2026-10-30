import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Botao } from '../componentes/Botao';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CartaoLivro } from '../componentes/CartaoLivro';
import { useAcervo } from '../contexto/AcervoContexto';
import type { RotasDaPilha } from '../navegacao/tipos';
import { cores, espacos, larguraMaxima } from '../tema/tema';

type TelaAcervoProps = NativeStackScreenProps<RotasDaPilha, 'Acervo'>;

export function TelaAcervo({ navigation }: TelaAcervoProps) {
  const { estado, recarregar } = useAcervo();
  const { width } = useWindowDimensions();
  const duasColunas = width >= larguraMaxima;

  function conteudo() {
    switch (estado.tipo) {
      case 'carregando':
        return (
          <View style={estilos.centro}>
            <ActivityIndicator size="large" />
            <Text>Carregando o acervo...</Text>
          </View>
        );
      case 'erro':
        return (
          <View style={estilos.centro}>
            <Text style={estilos.erro}>Não foi possível carregar o acervo.</Text>
            <Text style={estilos.detalheDoErro}>{estado.mensagem}</Text>
            <View style={estilos.barra}>
              <Botao titulo="Tentar de novo" onPress={recarregar} />
            </View>
          </View>
        );
      case 'pronto':
        return (
          <FlatList
            key={duasColunas ? 'duas' : 'uma'}
            data={estado.livros}
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
        );
    }
  }

  return (
    <View style={estilos.tela}>
      <View style={estilos.barra}>
        <Botao titulo="Recarregar" variante="secundario" onPress={recarregar} />
        <Botao titulo="Novo livro" onPress={() => navigation.navigate('NovoLivro')} />
      </View>
      {conteudo()}
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo, padding: espacos.md },
  barra: { flexDirection: 'row', gap: espacos.sm, marginBottom: espacos.md },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: espacos.sm },
  erro: { color: cores.erro, fontWeight: 'bold' },
  detalheDoErro: { color: cores.textoSecundario, textAlign: 'center' },
  linhaDeColunas: { gap: espacos.sm },
  celula: { flex: 1 },
  detalhes: { color: cores.primario, fontWeight: 'bold', marginBottom: espacos.md },
});