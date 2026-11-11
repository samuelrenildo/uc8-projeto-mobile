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
      <TextInput
        style={estilos.input}
        placeholder="Digite o título ou autor..."
        placeholderTextColor="#9C8670"
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
  tela: { flex: 1, backgroundColor: '#2B1D14', padding: 16 },
  input: {
    backgroundColor: '#3A281C',
    color: '#F5ECD7',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#5A4030',
    marginBottom: 16,
    fontSize: 15,
  },
  cartao: {
    backgroundColor: '#3A281C',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#5A4030',
  },
  tituloLivro: { fontSize: 16, fontWeight: 'bold', color: '#F5ECD7' },
  autorLivro: { color: '#C8B596', marginBottom: 4 },
  exemplares: { fontSize: 14, color: '#D4AF37', fontWeight: 'bold' },
  vazio: { color: '#C8B596', marginTop: 24, textAlign: 'center' },
});