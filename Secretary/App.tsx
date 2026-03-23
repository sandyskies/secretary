import React from 'react';
import { AppRegistry } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import appConfig from './app.json';
const appName = appConfig.expo.name;

export default function App() {
  return <AppNavigator />;
}

AppRegistry.registerComponent(appName, () => App);
