import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList } from 'react-native';
import { useAcervo } from '../contexto/AcervoContexto';
import type { Livro } from '../contexto/AcervoContexto';

export function TelaBusca() {
  const { buscarPorTermo } = useAcervo();
  const [termo, setTermo] = useState<string>('');
  const [resultados, setResultados] = useState<Livro[]>([]);

  const handleBuscar = async (texto: string): Promise<void> => {
    setTermo(texto);
    if (texto.trim().length > 0) {
      const encontrados = await buscarPorTermo(texto);
      setResultados(encontrados);
    } else {
      setResultados([]);
    }
  };

  return (
    <View style={estilos.tela}>
      <Text style={estilos.tituloPagina}>Pesquisar Livros</Text>

      <TextInput
        style={estilos.input}
        placeholder="Digite o título ou autor..."
        placeholderTextColor="#64748B"
        value={termo}
        onChangeText={handleBuscar}
      />

      <FlatList<Livro>
        data={resultados}
        keyExtractor={(item: Livro) => String(item.id)}
        renderItem={({ item }: { item: Livro }) => (
          <View style={estilos.cartao}>
            <Text style={estilos.tituloLivro}>{item.titulo}</Text>
            <Text style={estilos.autorLivro}>Autor: {item.autor || 'Desconhecido'}</Text>
            <Text style={estilos.exemplares}>Disponíveis: {item.exemplares}</Text>
          </View>
        )}
        ListEmptyComponent={
          termo.trim().length > 0 ? (
            <Text style={estilos.vazio}>Nenhum livro encontrado.</Text>
          ) : (
            <Text style={estilos.vazio}>Digite algo para começar a busca.</Text>
          )
        }
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#13182C', padding: 16 },
  tituloPagina: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#FFFFFF' },
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
  cartao: {
    backgroundColor: '#1E2538',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A3456',
  },
  tituloLivro: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  autorLivro: { color: '#94A3B8', marginBottom: 4 },
  exemplares: { fontSize: 14, color: '#3B82F6', fontWeight: 'bold' },
  vazio: { color: '#94A3B8', marginTop: 24, textAlign: 'center' },
});