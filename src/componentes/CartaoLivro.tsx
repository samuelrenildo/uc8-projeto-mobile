import { useState } from 'react'; 
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { cores, espacos, raio } from '../tema/tema';
import type { Livro } from '../types/entidades';

interface CartaoLivroProps {
    livro: Livro;
    minimoExemplares?: number;
}

export function CartaoLivro({ livro, minimoExemplares = 2 } : CartaoLivroProps) {
    const [mostrarSinopse, setMostrarSinopse] = useState(false);
    
    return (
        <View style={estilos.cartao}>
      <View style={estilos.linha}>
        <View style={estilos.coluna}>
          <Text style={estilos.titulo}>{livro.titulo}</Text>
          <Text style={estilos.autor}>{livro.autor}</Text>
        </View>
        <View style={estilos.etiqueta}>
          <Text style={estilos.textoEtiqueta}>{livro.exemplares}</Text>
        </View>
      </View>
      <Pressable onPress={() => setMostrarSinopse(!mostrarSinopse)}>
        <Text style={estilos.acao}>{mostrarSinopse ? 'Esconder sinopse' : 'Ver sinopse'}</Text>
      </Pressable>
      {mostrarSinopse && <Text style={estilos.sinopse}>{livro.sinopse ?? 'Sem sinopse'}</Text>}
      {livro.exemplares < minimoExemplares && <Text style={estilos.alerta}>Poucos exemplares</Text>}
    </View>
    );
}

const estilos = StyleSheet.create({
  cartao: { backgroundColor: cores.superficie, borderRadius: raio, padding: espacos.md, marginBottom: espacos.sm },
  linha: { flexDirection: 'row', alignItems: 'flex-start', gap: espacos.sm },
  coluna: { flex: 1 },
  titulo: { fontSize: 18, fontWeight: 'bold', color: cores.texto },
  autor: { color: cores.textoSecundario },
  etiqueta: { backgroundColor: cores.primario, borderRadius: raio, paddingHorizontal: espacos.sm, paddingVertical: espacos.xs },
  textoEtiqueta: { color: cores.textoClaro, fontWeight: 'bold' },
  acao: { color: cores.primario, marginTop: espacos.sm },
  sinopse: { marginTop: espacos.sm, color: cores.texto },
  alerta: { color: cores.alerta, marginTop: espacos.xs },
});