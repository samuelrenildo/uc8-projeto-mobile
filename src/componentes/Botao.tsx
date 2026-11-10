import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface BotaoProps {
  titulo: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario';
  desabilitado?: boolean;
  carregando?: boolean;
}

export function Botao({
  titulo,
  onPress,
  variante = 'primario',
  desabilitado = false,
  carregando = false,
}: BotaoProps) {
  const ehSecundario = variante === 'secundario';

  return (
    <TouchableOpacity
      style={[
        estilos.botao,
        ehSecundario ? estilos.botaoSecundario : estilos.botaoPrimario,
        desabilitado && estilos.botaoDesabilitado,
      ]}
      onPress={onPress}
      disabled={desabilitado || carregando}
      activeOpacity={0.7}
    >
      {carregando ? (
        <ActivityIndicator color={ehSecundario ? '#3B82F6' : '#FFFFFF'} />
      ) : (
        <Text
          style={[
            estilos.textoBotao,
            ehSecundario ? estilos.textoSecundario : estilos.textoPrimario,
            desabilitado && estilos.textoDesabilitado,
          ]}
        >
          {titulo}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const estilos = StyleSheet.create({
  botao: {
    height: 44,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  botaoPrimario: {
    backgroundColor: '#1D4ED8',
  },
  botaoSecundario: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  botaoDesabilitado: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    opacity: 0.6,
  },
  textoBotao: {
    fontSize: 14,
    fontWeight: '600',
  },
  textoPrimario: {
    color: '#FFFFFF',
  },
  textoSecundario: {
    color: '#3B82F6',
  },
  textoDesabilitado: {
    color: '#64748B',
  },
});