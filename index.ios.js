
import { AppRegistry } from 'react-native';
import setup from './js/setup';
import { Client } from 'bugsnag-react-native';

const bugsnag = new Client();

AppRegistry.registerComponent('Organilog', setup);
