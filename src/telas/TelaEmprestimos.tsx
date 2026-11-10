import React from 'react';
import { StyleSheet, Text, View, FlatList, Alert } from 'react-native';
import { Botao } from '../componentes/Botao';
import { useAcervo } from '../contexto/AcervoContexto';
import type { Livro } from '../contexto/AcervoContexto';

export function TelaEmprestimos() {
  const { estado, emprestarLivro, devolverLivro } = useAcervo();

  if (estado.tipo === 'carregando') {
    return (
      <View style={estilos.telaCarregando}>
        <Text style={estilos.textoCarregando}>A carregar acervo...</Text>
      </View>
    );
  }

  if (estado.tipo === 'erro') {
    return (
      <View style={estilos.telaCarregando}>
        <Text style={estilos.textoErro}>{estado.mensagem}</Text>
      </View>
    );
  }

  const livros: Livro[] = estado.livros;

  const trancarEmprestimo = async (idLivro: number) => {
    try {
      await emprestarLivro(idLivro, 1);
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : 'Erro ao emprestar livro.';
      Alert.alert('Aviso', mensagem);
    }
  };

  const trancarDevolucao = async (idLivro: number) => {
    try {
      await devolverLivro(idLivro);
      Alert.alert('Sucesso', 'Devolução efetuada com sucesso!');
    } catch (erro) {
      const mensagem = erro instanceof Error ? erro.message : 'Erro ao devolver livro.';
      Alert.alert('Aviso', mensagem);
    }
  };

  return (
    <View style={estilos.tela}>
      <Text style={estilos.tituloPagina}>Gerenciamento de Empréstimos</Text>

      <FlatList
        data={livros}
        keyExtractor={(item: Livro) => String(item.id)}
        renderItem={({ item }: { item: Livro }) => (
          <View style={estilos.cartao}>
            <View style={estilos.info}>
              <Text style={estilos.tituloLivro}>{item.titulo}</Text>
              <Text style={estilos.autorLivro}>Autor: {item.autor || item.nome_autor || 'Desconhecido'}</Text>
              <Text style={estilos.exemplares}>
                Disponíveis: <Text style={estilos.destaque}>{item.exemplares}</Text>
              </Text>
            </View>

            <View style={estilos.acoes}>
              <View style={estilos.botaoWrap}>
                <Botao
                  titulo="Emprestar"
                  onPress={() => trancarEmprestimo(item.id)}
                  desabilitado={item.exemplares <= 0}
                />
              </View>
              <View style={estilos.botaoWrap}>
                <Botao
                  titulo="Devolver"
                  variante="secundario"
                  onPress={() => trancarDevolucao(item.id)}
                />
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={estilos.vazio}>Nenhum livro cadastrado no acervo.</Text>
        }
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#13182C', padding: 16 },
  telaCarregando: { flex: 1, backgroundColor: '#13182C', justifyContent: 'center', alignItems: 'center' },
  textoCarregando: { color: '#FFFFFF', fontSize: 16 },
  textoErro: { color: '#EF4444', fontSize: 16 },
  tituloPagina: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#FFFFFF' },
  cartao: {
    backgroundColor: '#1E2538',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A3456',
  },
  info: { marginBottom: 12 },
  tituloLivro: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  autorLivro: { color: '#94A3B8', marginBottom: 4 },
  exemplares: { fontSize: 14, color: '#FFFFFF' },
  destaque: { fontWeight: 'bold', color: '#3B82F6' },
  acoes: { flexDirection: 'row', gap: 12 },
  botaoWrap: { flex: 1 },
  vazio: { color: '#94A3B8', marginTop: 24, textAlign: 'center' },
});