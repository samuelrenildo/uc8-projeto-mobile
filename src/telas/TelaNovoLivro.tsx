import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FormularioLivro, type DadosLivro } from '../componentes/FormularioLivro';
import type { RotasDaPilha } from '../navegacao/tipos';
import { adicionarLivro } from '../servicos/acervo';

type TelaNovoLivroProps = NativeStackScreenProps<RotasDaPilha, 'NovoLivro'>;

export function TelaNovoLivro({ navigation }: TelaNovoLivroProps) {
  function adicionar(dados: DadosLivro) {
    adicionarLivro(dados);
    navigation.goBack();
  }

  return (
    <View style={estilos.tela}>
      <FormularioLivro aoAdicionar={adicionar} />
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: '#F6F8FA', padding: 16 },
});