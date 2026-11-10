import type { NavigatorScreenParams } from '@react-navigation/native';


export type RotasDaPilha = {
  Acervo: undefined;
  DetalheLivro: { id: number };
  TelaEmprestimos: undefined;
  TelaNovoLivro: undefined;
  NovoLivro: undefined;
};

export type RotasDasAbas = {
  AbaAcervo: NavigatorScreenParams<RotasDaPilha>;
  AbaBusca: undefined;
  AbaSobre: undefined;
  CadastrarLeitor: undefined;
};