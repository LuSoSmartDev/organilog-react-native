import I18n from 'react-native-i18n'
import moment from 'moment'

import en from './en'
import fr from './fr'

I18n.fallbacks = true;

I18n.translations = {
  fr,
  en,
}

const languageCode = I18n.locale.substr(0, 2) || 'fr';

I18n.locale = languageCode
moment.locale(I18n.locale)
