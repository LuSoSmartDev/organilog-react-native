export const properties = {
  id: 'string',
  serverId: {
    type: 'int',
    default: 0,
  },
  accountId: 'int',
  fkUserAppliIdFrom: {
    type: 'string',
  },
  fkUserServerIdFrom: {
    type: 'int',
    optional: true,
  },
  fkUserAppliIdTo: {
    type: 'string',
  },
  fkUserServerIdTo: {
    type: 'int',
    optional: true,
  },
  fkMessagerieAppliId: {
    type: 'string',
  },
  fkMessagerieServerId: {
    type: 'int',
    optional: true,
  },
  title: {
    type: 'string',
    default: '',
  },
  content: {
    type: 'string',
    default: '',
  },
  isFavorite: {
    type: 'int',
    default: 0,
  },
  isDraft: {
    type: 'int',
    default: 0,
  },
  isRead: {
    type: 'int',
    default: 0,
  },
  isDelete: {
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
  'addDate',
  'fkUserServerIdFrom',
  'fkUserServerIdTo',
  'fkMessagerieServerId',
  'title',
  'content',
  'isFavorite',
  'isDraft',
  'isRead',
  'isDelete',
  'isActif',
  'synchronizationDate',
]

export const mapServerField = {
  id: 'mesId',
  serverId: 'mesIdServer',
  // fkUserServerIdFrom: 'mesFkUserIdFrom',
  // fkUserServerIdTo: 'mesFkUserIdTo',
  fkUserServerIdFrom: 'mesFkUserFromUUID',
  fkUserServerIdTo: 'mesFkUserToUUID',
  fkMessagerieServerId: 'mesFkMesTo',
  // fkMessagerieAppliId: 'mesFkMesAppliTo',
  fkMessagerieAppliId: 'mesFkMesToUUID',
  title: 'mesTitle',
  content: 'mesContenu',
  isRead: 'mesIsRead',
  isFavorite: 'mesIsFavorite',
  isDraft: 'mesIsDraft',
  isDelete: 'mesIsDelete',
  isActif: 'mesIsActif',
}

export default {
  mapField,
  properties,
  mapServerField,
}
