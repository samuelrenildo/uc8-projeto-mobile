import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AcervoProvedor } from './src/contexto/AcervoContexto';
import { PilhaAcervo } from './src/navegacao/PilhaAcervo';
import type { RotasDasAbas } from './src/navegacao/tipos';
import { TelaBusca } from './src/telas/TelaBusca';
import { TelaSobre } from './src/telas/TelaSobre';

const Abas = createBottomTabNavigator<RotasDasAbas>();

export default function App() {
  return (
    <AcervoProvedor>
      <NavigationContainer>
        <Abas.Navigator>
          <Abas.Screen name="AbaAcervo" component={PilhaAcervo} options={{ title: 'Acervo', headerShown: false }} />
          <Abas.Screen name="AbaBusca" component={TelaBusca} options={{ title: 'Busca' }} />
          <Abas.Screen name="AbaSobre" component={TelaSobre} options={{ title: 'Sobre' }} />
        </Abas.Navigator>
      </NavigationContainer>
    </AcervoProvedor>
  );
}