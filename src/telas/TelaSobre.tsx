import { PixelRatio, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { cores, espacos } from '../tema/tema';

export function TelaSobre() {
  const { width, height, fontScale } = useWindowDimensions();

  return (
    <View style={estilos.tela}>
      <Text style={estilos.titulo}>Biblioteca</Text>
      <Text>Aplicativo de biblioteca: acervo de livros com lista, cadastro e detalhe.</Text>
      <Text style={estilos.medida}>Janela: {Math.round(width)} x {Math.round(height)} dp</Text>
      <Text style={estilos.medida}>Densidade: {PixelRatio.get()}x</Text>
      <Text style={estilos.medida}>Escala da fonte: {fontScale}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo, padding: espacos.md },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: espacos.md, color: cores.texto },
  medida: { marginTop: espacos.sm, color: cores.textoSecundario },
});