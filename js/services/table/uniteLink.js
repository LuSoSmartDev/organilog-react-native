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
  fkUniteAppliId: 'string',
  fkUniteServerId: {
    type: 'int',
    optional: true,
  },
  linkTableName: {
    type: 'string',
    default: 0,
  },
  fkColumnAppliId: 'string',
  fkColumnServerId: {
    type: 'int',
    optional: true,
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
  uniteValue: {
    type: 'string',
    default: '',
  },
  isActif: {
    type: 'int',
    default: 1,
  },
}

export const mapField = [
  'addDate',
  'serverId',
  'fkUniteServerId',
  'linkTableName',
  'fkColumnServerId',
  'uniteValue',
  'isActif',
  'editDate',
]

export const mapServerField = {
  id: 'ulId',
  serverId: 'ulIdServer',
  fkUniteServerId: 'ulFkUnIdServer',
  fkUniteAppliId: 'ulFkUnUUID',
  linkTableName: 'ulLinkTable',
  isActif: 'taIsActif',
  fkColumnAppliId: 'ulFkColUUID',
  fkColumnServerId: 'ulFkColIdServer',
  addDate: 'ulOn',
  uniteValue: 'ulValue',
}

export default {
  mapField,
  properties,
  mapServerField,
}
