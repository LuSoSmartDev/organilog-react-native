import {
  parseDateFromUnixTime,
} from '../utils/transform.js'

export const properties = {
  id: 'string',
  serverId: {
    type: 'int',
    default: 0,
  },
  accountId: 'int',
  name: 'string',
  value: {
    type: 'string',
    default: '',
  },
  type: {
    type: 'string',
    default: 'Text',
  },
  arrange: {
    type: 'string',
    default: '',
  },
  categoryKey: {
    type: 'string',
    default: 'UNDEFINED',
  },
  description: {
    type: 'string',
    default: '',
  },
  defaultValue: {
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
  isToSync: {
    type: 'int',
    default: 0,
  },
}

export const mapField = ['addDate', 'name', 'value', 'isActif']

export const mapFieldTransform = {
  addDate: parseDateFromUnixTime,
  synchronizationDate: parseDateFromUnixTime,
}

export default {
  mapField,
  properties,
  mapFieldTransform,
}
