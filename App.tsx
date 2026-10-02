import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { CartaoLivro } from './src/componentes/CartaoLivro';
import { FormularioLivro, type DadosLivro } from './src/componentes/FormularioLivro';
import { carregarLivros } from './src/servicos/acervos';
import type { Livro } from './src/types/entidades';

export default function App() {
  const [livros, setLivros] = useState<Livro[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarLivros().then((resultado) => {
      setLivros(resultado);
      setCarregando(false);
    });
  }, []);

  function adicionar(dados: DadosLivro) {
    const proximoId = livros.reduce((maior, atual) => Math.max(maior, atual.id), 0) + 1;
    setLivros([{ id: proximoId, ...dados }, ...livros]);
  }


  return (
    <View style={estilos.tela}>
      <Text style={estilos.cabecalho}>Acervo</Text>
      <FormularioLivro aoAdicionar={adicionar} />
      <FlatList
        data={livros}
        keyExtractor={(livro) => String(livro.id)}
        renderItem={({ item }) => <CartaoLivro livro={item} />}
        ListEmptyComponent={<Text>Nenhum livro no acervo.</Text>}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#F6F8FA', paddingTop: 48, paddingHorizontal: 16 },
  cabecalho: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
});