import { View, Text, StyleSheet } from 'react-native';
import type { Livro } from '../types/entidades';

interface CartaoLivroProps {
    livro: Livro;
}

export function CartaoLivro({ livro} : CartaoLivroProps) {
    return (
        <View style={estilos.cartao}>
            <Text style={estilos.titulo}>{livro.titulo}</Text>
            <Text style={estilos.autor}>{livro.autor}</Text>
            <Text style={estilos.texto}>{livro.sinopse ?? 'Sinopse não cadastrada'}</Text>
            <Text style={estilos.texto}>{livro.exemplares} exemplares disponíveis</Text>
        </View>
    );
}

const estilos = StyleSheet.create({
    cartao: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
    },
    titulo: {
        fontSize: 18,
        fontWeight: 'bold', 
    },
    autor: {
        fontSize: 14,
        color: '#555',
        marginBottom: 4,
    },
    texto: {
        fontSize: 14,
    },
});
