import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { CartaoLivro } from '../componentes/CartaoLivro';
import { FormularioLivro, type DadosLivro } from '../componentes/FormularioLivro';
import { carregarLivros } from '../servicos/acervos';
import type { Livro } from '../types/entidades';

export function TelaAcervo() {
  const [livros, setLivros] = useState<Livro[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
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
  }, [tentativa]);

  function adicionar(dados: DadosLivro) {
    const proximoId = livros.reduce((maior, atual) => Math.max(maior, atual.id), 0) + 1;
    setLivros([{ id: proximoId, ...dados }, ...livros]);
  }

  return (
    <View style={estilos.tela}>
      <Text style={estilos.cabecalho}>Acervo</Text>
      <Pressable style={estilos.botao} onPress={() => setTentativa(tentativa + 1)}>
        <Text style={estilos.textoBotao}>Recarregar</Text>
      </Pressable>
      {carregando ? (
        <View style={estilos.centro}>
          <ActivityIndicator size="large" />
          <Text>Carregando o acervo...</Text>
        </View>
      ) : (
        <>
          <FormularioLivro aoAdicionar={adicionar} />
          <FlatList
            data={livros}
            keyExtractor={(livro) => String(livro.id)}
            renderItem={({ item }) => <CartaoLivro livro={item} />}
            ListEmptyComponent={<Text>Nenhum livro no acervo.</Text>}
          />
        </>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#F6F8FA', paddingTop: 48, paddingHorizontal: 16 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cabecalho: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  botao: { backgroundColor: '#004A8D', borderRadius: 6, padding: 12, alignItems: 'center', marginBottom: 16 },
  textoBotao: { color: '#fff', fontWeight: 'bold' },
});