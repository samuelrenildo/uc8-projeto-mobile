import { StyleSheet, Text, View } from 'react-native';

export function TelaBusca() {
  return (
    <View style={estilos.tela}>
      <Text style={estilos.titulo}>Busca</Text>
      <Text>Busca de livros em um catálogo da rede. O conteúdo desta tela entra quando o aplicativo consumir dados da rede.</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#F6F8FA', padding: 16 },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
});