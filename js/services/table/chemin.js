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
  nom: {
    type: 'string',
    default: '',
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
}

export const mapField = [
  'addDate',
  'serverId',
  'code',
  'nom',
  'comment',
  'isActif',
  'synchronizationDate',
]

export const mapFieldDetail = {
  nom: 'NOM',
  comment: 'COMMENT',
}

export default {
  mapField,
  properties,
  mapFieldDetail,
}
