import React, { useState } from 'react';
import { Modal, StyleSheet, Text, View, FlatList, TouchableOpacity, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAcervo } from '../contexto/AcervoContexto';
import type { Livro } from '../contexto/AcervoContexto';
import type { RotasDaPilha } from '../navegacao/tipos';
import { registrarErro } from '../erros/erros';
import { listarLeitores, type LeitorBD } from '../data/bibliotecaService';

type TelaAcervoProps = NativeStackScreenProps<RotasDaPilha, 'Acervo'>;

export function TelaAcervo({ navigation }: TelaAcervoProps) {
  const { estado, emprestarLivro, devolverLivro } = useAcervo();
  const [processandoId, setProcessandoId] = useState<number | null>(null);
  const [idLivroEmprestimo, setIdLivroEmprestimo] = useState<number | null>(null);
  const [leitores, setLeitores] = useState<LeitorBD[]>([]);

  if (estado.tipo === 'carregando') {
    return (
      <View style={estilos.centralizado}>
        <Text style={estilos.textoCarregando}>A carregar acervo...</Text>
      </View>
    );
  }

  if (estado.tipo === 'erro') {
    return (
      <View style={estilos.centralizado}>
        <Text style={estilos.textoErro}>{estado.mensagem}</Text>
      </View>
    );
  }

  const confirmarEmprestimo = async (idLivro: number, idLeitor: number): Promise<void> => {
    try {
      setProcessandoId(idLivro);
      await emprestarLivro(idLivro, idLeitor);
      Alert.alert('Sucesso', 'Empréstimo realizado com sucesso!');
    } catch (erro: unknown) {
      registrarErro('emprestimo', erro);
      const mensagem = erro instanceof Error ? erro.message : 'Erro ao emprestar livro.';
      Alert.alert('Aviso', mensagem);
    } finally {
      setProcessandoId(null);
    }
  };

  const handleEmprestar = async (idLivro: number): Promise<void> => {
    try {
      const dados = await listarLeitores();
      if (dados.length === 0) {
        Alert.alert('Aviso', 'Cadastre um leitor antes de fazer empréstimos.');
        return;
      }
      setLeitores(dados);
      setIdLivroEmprestimo(idLivro);
    } catch (erro: unknown) {
      registrarErro('emprestimo', erro);
      Alert.alert('Aviso', 'Não foi possível carregar os leitores.');
    }
  };

  const escolherLeitor = (idLeitor: number): void => {
    if (idLivroEmprestimo === null) {
      return;
    }
    const idLivro = idLivroEmprestimo;
    setIdLivroEmprestimo(null);
    confirmarEmprestimo(idLivro, idLeitor);
  };

  const handleDevolver = async (idLivro: number): Promise<void> => {
    try {
      setProcessandoId(idLivro);
      await devolverLivro(idLivro);
      Alert.alert('Sucesso', 'Livro devolvido com sucesso!');
    } catch (erro: unknown) {
      registrarErro('devolucao', erro);
      const mensagem = erro instanceof Error ? erro.message : 'Erro ao devolver livro.';
      Alert.alert('Aviso', mensagem);
    } finally {
      setProcessandoId(null);
    }
  };

  return (
    <View style={estilos.tela}>
      <View style={estilos.cabecalhoLista}>
        <TouchableOpacity
          style={estilos.botaoNovo}
          onPress={() => navigation.navigate('TelaNovoLivro')}
        >
          <Ionicons name="add" size={20} color="#F5ECD7" />
          <Text style={estilos.textoBotaoNovo}>Novo Livro</Text>
        </TouchableOpacity>
      </View>

      <FlatList<Livro>
        data={estado.livros}
        keyExtractor={(item: Livro) => String(item.id)}
        renderItem={({ item }: { item: Livro }) => (
          <View style={estilos.cartao}>
            <TouchableOpacity
              onPress={() => navigation.navigate('DetalheLivro', { id: item.id })}
              style={{ flex: 1 }}
            >
              <Text style={estilos.tituloLivro}>{item.titulo}</Text>
              <Text style={estilos.autorLivro}>Autor: {item.autor || 'Desconhecido'}</Text>
              <Text style={estilos.exemplares}>Disponíveis: {item.exemplares}</Text>
            </TouchableOpacity>

            <View style={estilos.containerBotoesAcao}>
              <TouchableOpacity
                style={[estilos.botaoAcao, estilos.botaoEmprestar]}
                onPress={() => handleEmprestar(item.id)}
                disabled={processandoId === item.id || item.exemplares <= 0}
              >
                <Text style={estilos.textoBotaoAcao}>Emprestar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[estilos.botaoAcao, estilos.botaoDevolver]}
                onPress={() => handleDevolver(item.id)}
                disabled={processandoId === item.id}
              >
                <Text style={estilos.textoBotaoAcao}>Devolver</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={estilos.vazio}>Nenhum livro cadastrado no acervo.</Text>
        }
      />

      <Modal
        visible={idLivroEmprestimo !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setIdLivroEmprestimo(null)}
      >
        <View style={estilos.fundoModal}>
          <View style={estilos.caixaModal}>
            <Text style={estilos.tituloModal}>Escolha o leitor</Text>

            <FlatList<LeitorBD>
              data={leitores}
              keyExtractor={(item: LeitorBD) => String(item.id)}
              style={estilos.listaLeitores}
              renderItem={({ item }: { item: LeitorBD }) => (
                <TouchableOpacity
                  style={estilos.opcaoLeitor}
                  onPress={() => escolherLeitor(item.id)}
                >
                  <Text style={estilos.nomeLeitor}>{item.nome}</Text>
                  <Text style={estilos.matriculaLeitor}>Matrícula: {item.matricula}</Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={estilos.botaoCancelarModal}
              onPress={() => setIdLivroEmprestimo(null)}
            >
              <Text style={estilos.textoCancelarModal}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#2B1D14', padding: 16 },
  centralizado: { flex: 1, backgroundColor: '#2B1D14', justifyContent: 'center', alignItems: 'center' },
  cabecalhoLista: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 16 },
  botaoNovo: {
    flexDirection: 'row',
    backgroundColor: '#7B1E1E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    gap: 4
  },
  textoBotaoNovo: { color: '#F5ECD7', fontWeight: 'bold', fontSize: 14 },
  cartao: {
    backgroundColor: '#3A281C',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#5A4030',
  },
  tituloLivro: { fontSize: 16, fontWeight: 'bold', color: '#F5ECD7' },
  autorLivro: { color: '#C8B596', marginVertical: 4 },
  exemplares: { fontSize: 14, color: '#D4AF37', fontWeight: 'bold', marginBottom: 12 },
  containerBotoesAcao: { flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: '#5A4030', paddingTop: 12 },
  botaoAcao: { flex: 1, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  botaoEmprestar: { backgroundColor: '#2E6B3F' },
  botaoDevolver: { backgroundColor: '#9A6B12' },
  textoBotaoAcao: { color: '#F5ECD7', fontWeight: 'bold', fontSize: 12 },
  vazio: { color: '#C8B596', marginTop: 32, textAlign: 'center' },
  textoCarregando: { color: '#F5ECD7', fontSize: 16 },
  textoErro: { color: '#D9534F', fontSize: 16 },
  fundoModal: {
    flex: 1,
    backgroundColor: 'rgba(26, 17, 11, 0.85)',
    justifyContent: 'center',
    padding: 24,
  },
  caixaModal: {
    backgroundColor: '#3A281C',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#5A4030',
    padding: 16,
    maxHeight: '80%',
  },
  tituloModal: { fontSize: 18, fontWeight: 'bold', color: '#F5ECD7', marginBottom: 12 },
  listaLeitores: { maxHeight: 360 },
  opcaoLeitor: {
    backgroundColor: '#2B1D14',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#5A4030',
    padding: 12,
    marginBottom: 8,
  },
  nomeLeitor: { fontSize: 16, fontWeight: 'bold', color: '#F5ECD7' },
  matriculaLeitor: { fontSize: 13, color: '#C8B596', marginTop: 2 },
  botaoCancelarModal: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
    alignItems: 'center',
  },
  textoCancelarModal: { color: '#D4AF37', fontWeight: 'bold', fontSize: 15 },
});
