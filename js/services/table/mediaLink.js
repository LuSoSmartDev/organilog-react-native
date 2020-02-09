export const properties = {
  id: 'string',
  serverId: {
    type: 'int',
    default: 0,
  },
  accountId: 'int',
  fkMediaAppliId: {
    type: 'string',
  },
  fkMediaServerId: {
    type: 'int',
    default: 0,
  },
  linkTableName: {
    type: 'string',
    optional: true,
  },
  fkColumnAppliId: {
    type: 'string',
  },
  fkColumnServerId: {
    type: 'int',
    optional: true,
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
  isDelete: {
    type: 'int',
    default: 0,
  },
}

export const mapField = [
  'addDate',
  'serverId',
  // 'accountId',
  // 'fkMediaAppliId',
  'fkMediaServerId',
  'linkTableName',
  // 'fkColumnAppliId',
  'fkColumnServerId',
  'isActif',
  // 'synchronizationDate',
  // 'addDate',
  'editDate',
  // 'lastViewDate',
  // 'isToSync',
  // 'isDelete',
]

export const mapServerField = {
  id: 'ulAppId',
  serverId: 'ulId',
  code: 'ulCode',
  fkMediaAppliId: 'ulMediaUUID',
  fkMediaServerId: 'ulMediaServerId',
  linkTableName: 'ulLinkTable',
  fkColumnAppliId: 'ulColumnUUID',
  fkColumnServerId: 'ulColumnServerId',
  isActif: 'ulActif',
  addDate: 'ulCreatedOn',
  editDate: 'ulModifDate',
}

export default {
  mapField,
  properties,
}
