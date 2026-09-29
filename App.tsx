import { ScrollView, StyleSheet } from 'react-native';
import type { Livro } from './src/types/entidades';
import { CartaoLivro } from './src/componentes/CartaoLivro';


const livro1: Livro = {
  id: 1,
  titulo: 'O Senhor dos Anéis',
  autor: 'J.R.R. Tolkien',
  sinopse: 'Uma épica aventura de fantasia que segue a jornada de Frodo Bolseiro para destruir o Um Anel.',
  exemplares: 5,
}

const livro2: Livro = {
  id: 2,
  titulo: '1984',
  autor: 'George Orwell',
  exemplares: 1,
};

export default function App() {
  return (
    <ScrollView style={estilos.container} contentContainerStyle={estilos.conteudo}>
      <CartaoLivro livro={livro1} />
      <CartaoLivro livro={livro2} />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
  },
  conteudo: {
    padding: 16,
  },
});
