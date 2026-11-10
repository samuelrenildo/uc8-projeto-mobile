import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAcervo } from '../contexto/AcervoContexto';
import type { Livro } from '../contexto/AcervoContexto';
import type { RotasDaPilha } from '../navegacao/tipos';

type TelaAcervoProps = NativeStackScreenProps<RotasDaPilha, 'Acervo'>;

export function TelaAcervo({ navigation }: TelaAcervoProps) {
  const { estado, emprestarLivro, devolverLivro } = useAcervo();
  const [processandoId, setProcessandoId] = useState<number | null>(null);

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

  const handleEmprestar = async (idLivro: number): Promise<void> => {
    try {
      setProcessandoId(idLivro);
      // Por defeito, usamos o leitor com ID 1 para agilizar o empréstimo rápido
      await emprestarLivro(idLivro, 1);
      Alert.alert('Sucesso', 'Empréstimo realizado com sucesso!');
    } catch (erro: unknown) {
      const mensagem = erro instanceof Error ? erro.message : 'Erro ao emprestar livro.';
      Alert.alert('Aviso', mensagem);
    } finally {
      setProcessandoId(null);
    }
  };

  const handleDevolver = async (idLivro: number): Promise<void> => {
    try {
      setProcessandoId(idLivro);
      await devolverLivro(idLivro);
      Alert.alert('Sucesso', 'Livro devolvido com sucesso!');
    } catch (erro: unknown) {
      const mensagem = erro instanceof Error ? erro.message : 'Erro ao devolver livro.';
      Alert.alert('Aviso', mensagem);
    } finally {
      setProcessandoId(null);
    }
  };

  return (
    <View style={estilos.tela}>
      <View style={estilos.cabecalhoLista}>
        <Text style={estilos.tituloPagina}>Livros no Acervo</Text>
        <TouchableOpacity 
          style={estilos.botaoNovo}
          onPress={() => navigation.navigate('TelaNovoLivro')}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
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
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#13182C', padding: 16 },
  centralizado: { flex: 1, backgroundColor: '#13182C', justifyContent: 'center', alignItems: 'center' },
  cabecalhoLista: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  tituloPagina: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  botaoNovo: { 
    flexDirection: 'row', 
    backgroundColor: '#3B82F6', 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 8, 
    alignItems: 'center',
    gap: 4 
  },
  textoBotaoNovo: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  cartao: {
    backgroundColor: '#1E2538',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A3456',
  },
  tituloLivro: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  autorLivro: { color: '#94A3B8', marginVertical: 4 },
  exemplares: { fontSize: 14, color: '#3B82F6', fontWeight: 'bold', marginBottom: 12 },
  containerBotoesAcao: { flexDirection: 'row', gap: 8, borderTopWidth: 1, borderTopColor: '#2A3456', paddingTop: 12 },
  botaoAcao: { flex: 1, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  botaoEmprestar: { backgroundColor: '#10B981' },
  botaoDevolver: { backgroundColor: '#F59E0B' },
  textoBotaoAcao: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
  vazio: { color: '#94A3B8', marginTop: 32, textAlign: 'center' },
  textoCarregando: { color: '#FFFFFF', fontSize: 16 },
  textoErro: { color: '#EF4444', fontSize: 16 },
});