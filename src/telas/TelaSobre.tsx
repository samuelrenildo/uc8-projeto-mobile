import { useCallback, useState } from 'react';
import { PixelRatio, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { contarLocal } from '../banco/banco';
import { registrarErro } from '../erros/erros';
import { cores, espacos } from '../tema/tema';

export function TelaSobre() {
  const { width, height, fontScale } = useWindowDimensions();
  const [guardados, setGuardados] = useState('...');

  useFocusEffect(
    useCallback(() => {
      let cancelado = false;
      contarLocal()
        .then((total) => {
          if (!cancelado) {
            setGuardados(String(total));
          }
        })
        .catch((erro: unknown) => {
          registrarErro('contagem', erro);
          if (!cancelado) {
            setGuardados('indisponível');
          }
        });
      return () => {
        cancelado = true;
      };
    }, []),
  );

  return (
    <View style={estilos.tela}>
      <Text style={estilos.titulo}>Biblioteca</Text>
      <Text style={estilos.descricao}>Aplicativo de biblioteca: acervo de livros com lista, cadastro e detalhe.</Text>
      <Text style={estilos.medida}>Janela: {Math.round(width)} x {Math.round(height)} dp</Text>
      <Text style={estilos.medida}>Densidade: {PixelRatio.get()}x</Text>
      <Text style={estilos.medida}>Escala da fonte: {fontScale}</Text>
      <Text style={estilos.medida}>Guardados no aparelho: {guardados}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela:   { flex: 1, backgroundColor: cores.fundo, padding: espacos.md },
  titulo: { fontSize: 24, marginBottom: espacos.md, color: cores.texto },
  descricao: { fontSize: 16, color: cores.destaque },
  medida: { marginTop: espacos.sm, color: cores.textoSecundario },
});