import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export interface DadosLivro {
    titulo: string;
    autor: string;
    exemplares: number;
}

interface FormularioLivroProps {
    aoAdicionar: (dados: DadosLivro) => void;
}

export function FormularioLivro({ aoAdicionar} : FormularioLivroProps) {
    const [titulo, setTitulo] = useState('');
    const [autor, setAutor] = useState('');
    const [exemplares, setExemplares] = useState('1');


    function enviar() {
        const quantidade = Number(exemplares);
        aoAdicionar({ titulo, autor, exemplares: quantidade });
        setTitulo('');
        setAutor('');
        setExemplares('1');
    }

    return (
        <View style={estilos.formulario}>
      <TextInput
        style={estilos.campo}
        placeholder="Título"
        value={titulo}
        onChangeText={setTitulo}
      />
      <TextInput
        style={estilos.campo}
        placeholder="Autor"
        value={autor}
        onChangeText={setAutor}
      />
      <TextInput
        style={estilos.campo}
        placeholder="Exemplares"
        keyboardType="numeric"
        value={exemplares}
        onChangeText={setExemplares}
      />
      <Pressable style={estilos.botao} onPress={enviar}>
        <Text style={estilos.textoBotao}>Adicionar</Text>
      </Pressable>
    </View>
    )
}

const estilos = StyleSheet.create({
  formulario: { marginBottom: 16 },
  campo: { backgroundColor: '#fff', borderRadius: 6, padding: 10, marginBottom: 8 },
  botao: { backgroundColor: '#004A8D', borderRadius: 6, padding: 12, alignItems: 'center' },
  textoBotao: { color: '#fff', fontWeight: 'bold' },
});

