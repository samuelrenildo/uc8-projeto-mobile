import { StyleSheet, Text, View } from 'react-native';

export function TelaSobre() {
  return (
    <View style={estilos.tela}>
      <Text style={estilos.titulo}>Biblioteca</Text>
      <Text>Aplicativo de biblioteca: acervo de livros com lista, cadastro e detalhe.</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#F6F8FA', padding: 16 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
});