import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FormularioLivro, type DadosLivro } from '../componentes/FormularioLivro';
import { useAcervo } from '../contexto/AcervoContexto';
import { registrarErro } from '../erros/erros';
import type { RotasDaPilha } from '../navegacao/tipos';
import { cores, espacos } from '../tema/tema';

type TelaNovoLivroProps = NativeStackScreenProps<RotasDaPilha, 'NovoLivro'>;

export function TelaNovoLivro({ navigation }: TelaNovoLivroProps) {
  const { incluir } = useAcervo();
  const [erro, setErro] = useState<string | undefined>(undefined);

  function adicionar(dados: DadosLivro) {
    setErro(undefined);
    incluir(dados)
      .then(() => {
        navigation.goBack();
      })
      .catch((falha: unknown) => {
        setErro(registrarErro('cadastro', falha).mensagem);
      });
  }

  return (
    <View style={estilos.tela}>
      <FormularioLivro aoAdicionar={adicionar} />
      {erro !== undefined && <Text style={estilos.erro}>{erro}</Text>}
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo, padding: espacos.md },
  erro: { color: cores.erro, fontWeight: 'bold', marginTop: espacos.sm },
});