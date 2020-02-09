import {
  parseDateFromUnixTime,
} from '../utils/transform.js'

export const properties = {
  id: 'string',
  serverId: {
    type: 'int',
    default: 0,
  },
  accountId: {
    type: 'int',
    default: 0,
  },
  typeStr: {
    type: 'string',
    default: '',
  },
  nom: {
    type: 'string',
    default: '',
  },
  isAlwaysVisible: {
    type: 'int',
    default: 0,
  },
  comment: {
    type: 'string',
    default: '',
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
  fieldType: {
    type: 'int',
    default: 0,
  },
  filialeServerKey: {
    type: 'int',
    default: 0,
  },
}

export const mapField = [
  'addDate',
  'serverId',
  'typeStr',
  'nom',
  'isAlwaysVisible',
  'isActif',
  'synchronizationDate',
  'filialeServerKey',
  'fieldType',  
]

export const mapFieldTransform = {
  addDate: parseDateFromUnixTime,
  // synchronizationDate: parseDateFromUnixTime,
}

export const mapServerField = {
  id: 'taId',
  serverId: 'taServerId',
  accountId: 'taAccountId',
  code: 'taCode',
  comment: 'taComment',
  isActif: 'taIsActif',
  synchronizationDate: 'taSynchronizationDate',
  addDate: 'taAddDate',
  editDate: 'taEditDate',
  lastViewDate: 'taLastViewDate',
  isToSync: 'taIsToSync',
}

export default {
  mapField,
  properties,
  mapServerField,
}
