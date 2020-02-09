export const properties = {
  id: 'string',
  serverId: {
    type: 'int',
    default: 0,
  },
  accountId: 'int',
  code: {
    type: 'int',
    optional: true,
  },
  adresse: {
    type: 'string',
    default: '',
  },
  codePostal: {
    type: 'string',
    default: '',
  },
  ville: {
    type: 'string',
    default: '',
  },
  phone: {
    type: 'string',
    default: '',
  },
  fax: {
    type: 'string',
    default: '',
  },
  nom: {
    type: 'string',
    default: 'fr',
  },
  longitude: {
    type: 'string',
    default: '',
  },
  latitude: {
    type: 'string',
    default: '',
  },
  comment: {
    type: 'string',
    default: '',
  },
  isFavorite: {
    type: 'int',
    default: 0,
  },
  isActif: {
    type: 'int',
    default: 1,
  },
  synchronizationDate: {
    type: 'date',
    optional: true,
  },
  addDate: {
    type: 'date',
    default: new Date(),
  },
  editDate: {
    type: 'date',
    default: new Date(),
  },
  lastViewDate: {
    type: 'date',
    default: new Date(),
  },
  isToSync: {
    type: 'int',
    default: 0,
  },
}

export const mapField = [
  'addDate',
  'serverId',
  'code',
  'adresse',
  'codePostal',
  'ville',
  'phone',
  'fax',
  'nom',
  'longitude',
  'latitude',
  'comment',
  'isFavorite',
  'isActif',
  'synchronizationDate',
]

export default {
  mapField,
  properties,
}
