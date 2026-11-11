import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAcervo } from '../contexto/AcervoContexto';
import { cores } from '../tema/tema';
import type { RotasDaPilha } from '../navegacao/tipos';
import { registrarErro } from '../erros/erros';

export function TelaDetalhesLivro() {
  const route = useRoute<RouteProp<RotasDaPilha, 'DetalheLivro'>>();
  const navigation = useNavigation();
  const { livros, atualizarAutor, excluirLivro } = useAcervo();
  const [excluindo, setExcluindo] = useState(false);

  const idLivro: number | undefined = route.params?.id;
  const livro = livros.find((l) => l.id === idLivro);

  const titulo = livro?.titulo ?? 'Livro sem título';
  const autor = livro?.autor ?? '';

  const [editando, setEditando] = useState(false);
  const [novoAutor, setNovoAutor] = useState(autor);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!editando) setNovoAutor(autor);
  }, [autor, editando]);

  const handleSalvar = async (): Promise<void> => {
    if (idLivro === undefined) {
      Alert.alert('Erro', 'Livro não identificado.');
      return;
    }
    if (!novoAutor.trim()) {
      Alert.alert('Atenção', 'Informe o nome do autor.');
      return;
    }
    if (novoAutor.trim() === autor) {
      setEditando(false);
      return;
    }

    try {
      setSalvando(true);
      await atualizarAutor(idLivro, novoAutor);
      setEditando(false);
      Alert.alert('Sucesso', 'Autor atualizado com sucesso!');
    } catch (erro: unknown) {
      registrarErro('atualizar autor', erro);
      const mensagem = erro instanceof Error ? erro.message : 'Erro ao atualizar o autor.';
      Alert.alert('Erro', mensagem);
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = (): void => {
    if (idLivro === undefined) {
      Alert.alert('Erro', 'Livro não identificado.');
      return;
    }
    Alert.alert('Confirmar Exclusão', `Deseja realmente excluir o livro "${titulo}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            setExcluindo(true);
            await excluirLivro(idLivro);
            Alert.alert('Sucesso', 'Livro excluído com sucesso!');
            if (navigation.canGoBack()) navigation.goBack();
          } catch (erro: unknown) {
            registrarErro('exclusao de livro', erro);
            const mensagem = erro instanceof Error ? erro.message : 'Erro ao excluir livro.';
            Alert.alert('Aviso', mensagem);
          } finally {
            setExcluindo(false);
          }
        },
      },
    ]);
  };

  const handleCancelar = (): void => {
    setNovoAutor(autor);
    setEditando(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <Ionicons name="book" size={36} color={cores.destaque} style={styles.icone} />
        <Text style={styles.label}>ID do Registro: {idLivro ?? 'N/A'}</Text>
        <Text style={styles.title}>{titulo}</Text>
        <Text style={styles.author}>Autor: {autor || 'Autor não informado'}</Text>
        {livro?.exemplares !== undefined && (
          <Text style={styles.info}>Exemplares disponíveis: {livro.exemplares}</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.subtitulo}>Atualizar autor</Text>

        {editando ? (
          <>
            <TextInput
              style={styles.input}
              value={novoAutor}
              onChangeText={setNovoAutor}
              placeholder="Novo nome do autor"
              placeholderTextColor={cores.textoApagado}
              autoFocus
              editable={!salvando}
            />
            <View style={styles.linhaBotoes}>
              <TouchableOpacity
                style={[styles.botao, styles.botaoSecundario]}
                onPress={handleCancelar}
                disabled={salvando}
              >
                <Text style={styles.textoBotaoSecundario}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.botao, styles.botaoPrimario, salvando && styles.botaoDesativado]}
                onPress={handleSalvar}
                disabled={salvando}
              >
                {salvando ? (
                  <ActivityIndicator color={cores.texto} />
                ) : (
                  <Text style={styles.textoBotao}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <TouchableOpacity style={[styles.botao, styles.botaoPrimario]} onPress={() => setEditando(true)}>
            <Ionicons name="create-outline" size={18} color={cores.texto} />
            <Text style={styles.textoBotao}>Editar nome do autor</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={[styles.botao, styles.botaoExcluir, excluindo && styles.botaoDesativado]}
        onPress={handleExcluir}
        disabled={excluindo}
      >
        {excluindo ? (
          <ActivityIndicator color={cores.erro} />
        ) : (
          <>
            <Ionicons name="trash-outline" size={18} color={cores.erro} />
            <Text style={styles.textoBotaoExcluir}>Excluir livro</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: cores.fundoEscuro,
    gap: 16,
  },
  card: {
    padding: 20,
    backgroundColor: cores.superficie,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  icone: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: cores.textoSecundario,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: cores.texto,
    marginBottom: 12,
  },
  author: {
    fontSize: 16,
    color: cores.destaque,
  },
  info: {
    fontSize: 14,
    color: cores.textoSecundario,
    marginTop: 8,
  },
  subtitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: cores.texto,
    marginBottom: 12,
  },
  input: {
    backgroundColor: cores.fundo,
    color: cores.texto,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  linhaBotoes: {
    flexDirection: 'row',
    gap: 8,
  },
  botao: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  botaoPrimario: {
    backgroundColor: cores.primario,
  },
  botaoSecundario: {
    borderWidth: 1,
    borderColor: cores.destaque,
  },
  botaoExcluir: {
    flex: 0,
    borderWidth: 1,
    borderColor: cores.erro,
  },
  textoBotaoExcluir: {
    color: cores.erro,
    fontWeight: 'bold',
    fontSize: 15,
  },
  botaoDesativado: {
    opacity: 0.6,
  },
  textoBotao: {
    color: cores.texto,
    fontWeight: 'bold',
    fontSize: 15,
  },
  textoBotaoSecundario: {
    color: cores.destaque,
    fontWeight: 'bold',
    fontSize: 15,
  },
});
