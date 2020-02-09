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
    optional: true,
  },
  code: {
    type: 'int',
    optional: true,
  },
  title: {
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
  isToSync: {
    type: 'int',
    default: 0,
  },
}

export const mapField = [
  'addDate',
  'serverId',
  'code',
  'title',
  'isActif',
  'synchronizationDate'
]

export const mapFieldTransform = {
  addDate: parseDateFromUnixTime,
}

export const mapFieldDetail = {
  title: 'TITLE',
}

export default {
  mapField,
  properties,
  mapFieldDetail,
}
