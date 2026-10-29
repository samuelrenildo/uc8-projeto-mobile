import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Botao } from '../componentes/Botao';
import { CartaoLivro } from '../componentes/CartaoLivro';
import type { RotasDaPilha } from '../navegacao/tipos';
import { carregarLivros, descreverErro } from '../servicos/acervo';
import { cores, espacos, larguraMaxima } from '../tema/tema';
import type { Livro } from '../types/entidades';

type TelaAcervoProps = NativeStackScreenProps<RotasDaPilha, 'Acervo'>;

type EstadoAcervo =
  | { tipo: 'carregando' }
  | { tipo: 'erro'; mensagem: string }
  | { tipo: 'pronto'; livros: Livro[] };

export function TelaAcervo({ navigation }: TelaAcervoProps) {
  const [estado, setEstado] = useState<EstadoAcervo>({ tipo: 'carregando' });
  const [tentativa, setTentativa] = useState(0);
  const { width } = useWindowDimensions();
  const duasColunas = width >= larguraMaxima;

  useFocusEffect(
    useCallback(() => {
      let cancelado = false;
      setEstado({ tipo: 'carregando' });
      carregarLivros()
        .then((livros) => {
          if (!cancelado) {
            setEstado({ tipo: 'pronto', livros });
          }
        })
        .catch((erro: unknown) => {
          if (!cancelado) {
            setEstado({ tipo: 'erro', mensagem: descreverErro(erro) });
          }
        });
      return () => {
        cancelado = true;
      };
    }, [tentativa]),
  );

  function recarregar() {
    setTentativa(tentativa + 1);
  }

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