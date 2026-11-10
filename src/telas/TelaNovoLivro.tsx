import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Botao } from '../componentes/Botao';
import { useAcervo } from '../contexto/AcervoContexto';
import type { RotasDaPilha } from '../navegacao/tipos';

type TelaNovoLivroProps = NativeStackScreenProps<RotasDaPilha, 'TelaNovoLivro'>;

export function TelaNovoLivro({ navigation }: TelaNovoLivroProps) {
  const { incluir } = useAcervo();

  const [titulo, setTitulo] = useState<string>('');
  const [autor, setAutor] = useState<string>('');
  const [isbn, setIsbn] = useState<string>('');
  const [exemplares, setExemplares] = useState<string>('1');
  const [carregando, setCarregando] = useState<boolean>(false);

  const handleSalvar = async (): Promise<void> => {
    if (!titulo.trim() || !autor.trim()) {
      Alert.alert('Aviso', 'Preencha o título e o autor do livro.');
      return;
    }

    const qtd = parseInt(exemplares, 10);
    if (isNaN(qtd) || qtd <= 0) {
      Alert.alert('Aviso', 'O número de exemplares deve ser válido.');
      return;
    }

    try {
      setCarregando(true);
      await incluir({
        titulo,
        autor,
        isbn: isbn.trim() ? isbn : undefined,
        exemplares: qtd,
      });
      Alert.alert('Sucesso', 'Livro cadastrado com sucesso!');
      navigation.goBack();
    } catch (erro: unknown) {
      const mensagem = erro instanceof Error ? erro.message : 'Erro ao cadastrar livro.';
      Alert.alert('Erro', mensagem);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <View style={estilos.tela}>
      <Text style={estilos.tituloPagina}>Cadastrar Novo Livro</Text>

      <Text style={estilos.rotulo}>Título do Livro</Text>
      <TextInput
        style={estilos.input}
        placeholder="Ex: O Príncipe"
        placeholderTextColor="#64748B"
        value={titulo}
        onChangeText={setTitulo}
      />

      <Text style={estilos.rotulo}>Autor</Text>
      <TextInput
        style={estilos.input}
        placeholder="Ex: Niccolò Machiavelli"
        placeholderTextColor="#64748B"
        value={autor}
        onChangeText={setAutor}
      />

      <Text style={estilos.rotulo}>ISBN (Opcional)</Text>
      <TextInput
        style={estilos.input}
        placeholder="Ex: 978-3-16-148410-0"
        placeholderTextColor="#64748B"
        value={isbn}
        onChangeText={setIsbn}
      />

      <Text style={estilos.rotulo}>Quantidade de Exemplares</Text>
      <TextInput
        style={estilos.input}
        placeholder="1"
        placeholderTextColor="#64748B"
        keyboardType="numeric"
        value={exemplares}
        onChangeText={setExemplares}
      />

      <View style={estilos.botaoContainer}>
        <Botao titulo="Salvar Livro" onPress={handleSalvar} carregando={carregando} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#13182C', padding: 16 },
  tituloPagina: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#FFFFFF' },
  rotulo: { color: '#94A3B8', marginBottom: 6, fontSize: 14, fontWeight: '600' },
  input: {
    backgroundColor: '#1E2538',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A3456',
    marginBottom: 16,
    fontSize: 15,
  },
  botaoContainer: { marginTop: 12 },
});