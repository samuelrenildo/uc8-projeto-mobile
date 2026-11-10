import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAcervo } from '../contexto/AcervoContexto';
import { listarLeitores, cadastrarLeitor, excluirLeitor, type LeitorBD } from '../data/bibliotecaService';

export function TelaCadastroLeitor() {
  const { recarregarAcervo } = useAcervo();
  const [nome, setNome] = useState('');
  const [matricula, setMatricula] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [leitores, setLeitores] = useState<LeitorBD[]>([]);
  const [carregando, setCarregando] = useState(false);

  const carregarLeitores = useCallback(async (): Promise<void> => {
    try {
      const dados = await listarLeitores();
      setLeitores(dados);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar a lista de leitores.');
    }
  }, []);

  useEffect(() => {
    carregarLeitores();
  }, [carregarLeitores]);

  const handleCadastrar = async (): Promise<void> => {
    if (!nome.trim() || !matricula.trim()) {
      Alert.alert('Atenção', 'Preencha pelo menos o Nome e a Matrícula do leitor.');
      return;
    }

    try {
      setCarregando(true);
      await cadastrarLeitor({
        nome: nome.trim(),
        matricula: matricula.trim(),
        telefone: telefone.trim() || undefined,
        email: email.trim() || undefined,
      });

      Alert.alert('Sucesso', 'Leitor cadastrado com sucesso!');
      setNome('');
      setMatricula('');
      setTelefone('');
      setEmail('');
      await carregarLeitores();
      await recarregarAcervo();
    } catch (erro: unknown) {
      const mensagem = erro instanceof Error ? erro.message : 'Erro ao cadastrar leitor.';
      Alert.alert('Erro', mensagem);
    } finally {
      setCarregando(false);
    }
  };

  const handleExcluir = async (idLeitor: number): Promise<void> => {
    Alert.alert(
      'Confirmar Exclusão',
      'Deseja realmente excluir este leitor?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await excluirLeitor(idLeitor);
              Alert.alert('Sucesso', 'Leitor excluído com sucesso!');
              await carregarLeitores();
            } catch (erro: unknown) {
              const mensagem = erro instanceof Error ? erro.message : 'Erro ao excluir leitor.';
              Alert.alert('Aviso', mensagem); // Aqui aparece o aviso se ele tiver empréstimos ativos!
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={estilos.container}>
      <Text style={estilos.titulo}>Registar Novo Leitor</Text>

      <View style={estilos.grupoInput}>
        <Text style={estilos.rotulo}>Nome Completo *</Text>
        <TextInput
          style={estilos.input}
          placeholder="Ex: Ana Silva"
          placeholderTextColor="#64748B"
          value={nome}
          onChangeText={setNome}
        />
      </View>

      <View style={estilos.grupoInput}>
        <Text style={estilos.rotulo}>Matrícula *</Text>
        <TextInput
          style={estilos.input}
          placeholder="Ex: 2026001"
          placeholderTextColor="#64748B"
          value={matricula}
          onChangeText={setMatricula}
        />
      </View>

      <View style={estilos.grupoInput}>
        <Text style={estilos.rotulo}>Telefone</Text>
        <TextInput
          style={estilos.input}
          placeholder="Ex: (84) 99999-9999"
          placeholderTextColor="#64748B"
          value={telefone}
          onChangeText={setTelefone}
          keyboardType="phone-pad"
        />
      </View>

      <View style={estilos.grupoInput}>
        <Text style={estilos.rotulo}>E-mail</Text>
        <TextInput
          style={estilos.input}
          placeholder="Ex: ana@email.com"
          placeholderTextColor="#64748B"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity 
        style={[estilos.botao, carregando && estilos.botaoDesativado]} 
        onPress={handleCadastrar}
        disabled={carregando}
      >
        <Text style={estilos.textoBotao}>{carregando ? 'A registar...' : 'Cadastrar Leitor'}</Text>
      </TouchableOpacity>

      <View style={estilos.divisor} />

      <Text style={estilos.subtitulo}>Leitores Cadastrados ({leitores.length})</Text>

      {leitores.map((item) => (
        <View key={item.id} style={estilos.cartaoLeitor}>
          <View style={{ flex: 1 }}>
            <Text style={estilos.nomeLeitor}>{item.nome}</Text>
            <Text style={estilos.infoLeitor}>Matrícula: {item.matricula}</Text>
            {item.telefone ? <Text style={estilos.infoLeitor}>Tel: {item.telefone}</Text> : null}
            {item.email ? <Text style={estilos.infoLeitor}>E-mail: {item.email}</Text> : null}
          </View>

          <TouchableOpacity 
            style={estilos.botaoExcluir}
            onPress={() => handleExcluir(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#13182C', padding: 16 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 20, textAlign: 'center' },
  grupoInput: { marginBottom: 14 },
  rotulo: { color: '#94A3B8', fontSize: 14, marginBottom: 6, fontWeight: '600' },
  input: {
    backgroundColor: '#1E2538',
    borderWidth: 1,
    borderColor: '#2A3456',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  botao: {
    backgroundColor: '#3B82F6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  botaoDesativado: { opacity: 0.7 },
  textoBotao: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  divisor: { height: 1, backgroundColor: '#2A3456', marginVertical: 24 },
  subtitulo: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12 },
  cartaoLeitor: {
    backgroundColor: '#1E2538',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2A3456',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nomeLeitor: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  infoLeitor: { color: '#94A3B8', fontSize: 13, marginBottom: 2 },
  botaoExcluir: { padding: 8 },
});