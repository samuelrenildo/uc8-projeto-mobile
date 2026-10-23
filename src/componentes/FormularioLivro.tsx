import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Botao } from './Botao';
import { Campo } from './Campo';
import { espacos } from '../tema/tema';

export interface DadosLivro {
  titulo: string;
  autor: string;
  exemplares: number;
}

interface FormularioLivroProps {
  aoAdicionar: (dados: DadosLivro) => void;
}

export function FormularioLivro({ aoAdicionar }: FormularioLivroProps) {
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [exemplares, setExemplares] = useState('1');
  const [tocado, setTocado] = useState(false);

  const tituloVazio = titulo.trim() === '';
  const erroTitulo = tocado && tituloVazio ? 'Informe o título' : undefined;

  function mudarTitulo(texto: string) {
    setTocado(true);
    setTitulo(texto);
  }

  function enviar() {
    const quantidade = Number(exemplares);
    aoAdicionar({ titulo: titulo.trim(), autor, exemplares: quantidade });
    setTitulo('');
    setAutor('');
    setExemplares('1');
    setTocado(false);
  }

  return (
    <View style={estilos.formulario}>
      <Campo rotulo="Título" valor={titulo} aoMudar={mudarTitulo} erro={erroTitulo} />
      <Campo rotulo="Autor" valor={autor} aoMudar={setAutor} />
      <Campo rotulo="Exemplares" valor={exemplares} aoMudar={setExemplares} tipoDeTeclado="numeric" />
      <View style={estilos.acoes}>
        <Botao titulo="Adicionar" onPress={enviar} desabilitado={tituloVazio} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  formulario: { marginBottom: espacos.md },
  acoes: { flexDirection: 'row', marginTop: espacos.sm },
});