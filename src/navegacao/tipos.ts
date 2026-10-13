import type { NavigatorScreenParams } from '@react-navigation/native';


export type RotasDaPilha = {
  Acervo: undefined;
  DetalheLivro: { id: number };
};

export type RotasDasAbas = {
  AbaAcervo: NavigatorScreenParams<RotasDaPilha>;
  AbaSobre: undefined;
};