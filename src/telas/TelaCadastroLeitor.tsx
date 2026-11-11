import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAcervo } from '../contexto/AcervoContexto';
import { listarLeitores, cadastrarLeitor, excluirLeitor, type LeitorBD } from '../data/bibliotecaService';
import { registrarErro } from '../erros/erros';

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
    } catch (erro: unknown) {
      registrarErro('lista de leitores', erro);
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
      registrarErro('cadastro de leitor', erro);
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
              registrarErro('exclusao de leitor', erro);
              const mensagem = erro instanceof Error ? erro.message : 'Erro ao excluir leitor.';
              Alert.alert('Aviso', mensagem);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={estilos.container}>
      <Text style={estilos.titulo}>Registrar Novo Leitor</Text>

      <View style={estilos.grupoInput}>
        <Text style={estilos.rotulo}>Nome Completo *</Text>
        <TextInput
          style={estilos.input}
          placeholder="Ex: Ana Silva"
          placeholderTextColor="#9C8670"
          value={nome}
          onChangeText={setNome}
        />
      </View>

      <View style={estilos.grupoInput}>
        <Text style={estilos.rotulo}>Matrícula *</Text>
        <TextInput
          style={estilos.input}
          placeholder="Ex: 2026001"
          placeholderTextColor="#9C8670"
          value={matricula}
          onChangeText={setMatricula}
        />
      </View>

      <View style={estilos.grupoInput}>
        <Text style={estilos.rotulo}>Telefone</Text>
        <TextInput
          style={estilos.input}
          placeholder="Ex: (84) 99999-9999"
          placeholderTextColor="#9C8670"
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
          placeholderTextColor="#9C8670"
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
        <Text style={estilos.textoBotao}>{carregando ? 'Registrando...' : 'Cadastrar Leitor'}</Text>
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
            <Ionicons name="trash-outline" size={20} color="#D9534F" />
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#2B1D14', padding: 16 },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#F5ECD7', marginBottom: 20, textAlign: 'center' },
  grupoInput: { marginBottom: 14 },
  rotulo: { color: '#C8B596', fontSize: 14, marginBottom: 6, fontWeight: '600' },
  input: {
    backgroundColor: '#3A281C',
    borderWidth: 1,
    borderColor: '#5A4030',
    borderRadius: 8,
    padding: 12,
    color: '#F5ECD7',
    fontSize: 16,
  },
  botao: {
    backgroundColor: '#7B1E1E',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  botaoDesativado: { opacity: 0.7 },
  textoBotao: { color: '#F5ECD7', fontWeight: 'bold', fontSize: 16 },
  divisor: { height: 1, backgroundColor: '#5A4030', marginVertical: 24 },
  subtitulo: { fontSize: 18, fontWeight: 'bold', color: '#F5ECD7', marginBottom: 12 },
  cartaoLeitor: {
    backgroundColor: '#3A281C',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#5A4030',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nomeLeitor: { fontSize: 16, fontWeight: 'bold', color: '#F5ECD7', marginBottom: 4 },
  infoLeitor: { color: '#C8B596', fontSize: 13, marginBottom: 2 },
  botaoExcluir: { padding: 8 },
});