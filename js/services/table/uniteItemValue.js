import {
  parseDateFromUnixTime,
} from '../utils/transform.js'

export const properties = {
  id: 'string',
  accountId: {
    type: 'int',
    default: 0,
  },
  serverId: {
    type: 'int',
    default: 0,
  },
  uniteServerId: {
    type: 'int',
    default: 0,
  },
  value: {
    type: 'string',
    default: 0,
  },
  isActif: {
    type: 'int',
    default: 1,
  },
  addDate: {
    type: 'date',
    default: new Date(),
  },
  editDate: {
    type: 'date',
    default: new Date(),
  },
}

export const mapFieldTransform = {
  addDate: parseDateFromUnixTime,
}

export const mapField = [
  'addDate',
  'serverId',
  'uniteServerId',
  'value',
  'isActif',
  'editDate',
]

export default {
  mapField,
  properties,
}
