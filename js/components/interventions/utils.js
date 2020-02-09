import I18n from 'react-native-i18n'

function getPriorityText(intervention) {
  const priorities = [
    '',
    I18n.t('LOW'),
    I18n.t('NORMAL'),
    I18n.t('HIGH'),
    I18n.t('URGENT'),
    I18n.t('IMMEDIATE'),
  ]
  return priorities[intervention.priority || 1]
}

function getFullAddress(intervention) {
  const {
    address,
  } = intervention

  if (!address) return ''
  return [address.adresse, address.codePostal, address.ville].join(' ')
}

function getTime(intervention) {
  const {
    isDone,
    doneHourStart,
    doneHourEnd,
    planningHourStart,
    planningHourEnd,
  } = intervention
  if (isDone) {
    return [doneHourStart, doneHourEnd].join(' - ').trim()
  }
  return [planningHourStart, planningHourEnd].join(' - ').trim()
}

export default {
  getPriorityText,
  getFullAddress,
  getTime,
}
