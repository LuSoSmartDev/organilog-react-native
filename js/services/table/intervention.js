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
  code: {
    type: 'int',
    optional: true,
  },
  fkParentApplId: {
    type: 'string',
    optional: true,
  },
  fkParentServerlId: {
    type: 'int',
    optional: true,
  },
  fkUserAppliId: {
    type: 'string',
    optional: true
  },
  fkUserServerlId: {
    type: 'int',
    optional: true,
  },
  fkClientAppliId: {
    type: 'string',
  },
  fkClientServerId: {
    type: 'int',
    optional: true,
  },
  fkAdresseAppliId: {
    type: 'string',
  },
  fkAdresseServerId: {
    type: 'int',
    optional: true,
  },
  fkCheminAppliId: {
    type: 'string',
    optional: true,
  },
  fkCheminServerId: {
    type: 'int',
    optional: true,
  },
  fkMediaAppliIdSignature: {
    type: 'string',
    optional: true,
  },
  fkMediaServerIdSignature: {
    type: 'int',
    optional: true,
  },
  fkFilialeAppliId: {
    type: 'string',
    optional: true,
  },
  fkFilialeServerId: {
    type: 'int',
    optional: true,
  },
  nom: {
    type: 'string',
    default: '',
  },
  societe: {
    type: 'string',
    default: '',
  },
  priority: {
    type: 'int',
    default: 0,
  },
  planningDateStart: {
    type: 'date',
    optional: true,
  },
  planningDateEnd: {
    type: 'date',
    optional: true,
  },
  planningHourStart: {
    type: 'string',
    optional: true,
  },
  planningHourEnd: {
    type: 'string',
    optional: true,
  },
  planningHour: {
    type: 'string',
    optional: true,
  },
  planningComment: {
    type: 'string',
    optional: true,
  },
  isDone: {
    type: 'int',
    default: 0,
  },
  doneDateStart: {
    type: 'date',
    optional: true,
  },
  doneDateEnd: {
    type: 'date',
    optional: true,
  },
  doneHourStart: {
    type: 'string',
    optional: true,
  },
  doneHourEnd: {
    type: 'string',
    optional: true,
  },
  doneHour: {
    type: 'string',
    optional: true,
  },
  doneComment: {
    type: 'string',
    optional: true,
  },
  doneLongitude: {
    type: 'string',
    optional: true,
  },
  doneLatittude: {
    type: 'string',
    optional: true,
  },
  doneAltitude: {
    type: 'string',
    optional: true,
  },
  doneLocalisationMethod: {
    type: 'string',
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
  sendMail: {
    type: 'int',
    default: 0,
  },
}

export const mapField = [
  'addDate',
  'serverId',
  'code',
  'fkUserServerlId',
  'fkClientServerId',
  'fkAdresseServerId',
  'fkCheminServerId',
  'nom',
  'priority',
  'isDone',
  'isActif',
  'fkParentServerlId',
  'planningDateStart',
  'planningDateEnd',
  'planningHourStart',
  'planningHourEnd',
  'planningHour',
  'planningComment',
  'doneDateStart',
  'doneDateEnd',
  'doneHourStart',
  'doneHourEnd',
  'doneHour',
  'doneComment',
  'longitude',
  'latitude',
  '',
  '',
  'editDate',
  'fkFilialeServerId',
]

export const mapServerField = {
  id: 'intId',
  serverId: 'intIdServer',
  code: 'intCode',
  fkParentApplId: 'intFkParentUUID',
  fkParentServerlId: 'intFkParentId',
  fkUserServerlId: 'intFkUserId',
  fkUserAppliId: 'intFkUserUUID',
  fkClientServerId: 'intFkClientId',
  fkClientAppliId: 'intFkClientUUID',
  fkAdresseServerId: 'intFkAdresseId',
  fkAdresseAppliId: 'intFkAdresseUUID',
  fkCheminServerId: 'intFkCheminId',
  fkCheminAppliId: 'intFkCheminUUID',
  fkMediaServerId: 'intFkMediaIdSignature',
  fkMediaAppliId: 'intFkMediaUUIDSignature',
  fkFilialeServerId: 'intFkFilialeId',
  fkFilialeAppliId: 'intFkFilialeUUID',
  nom: 'intNom',
  priority: 'intPriority',
  planningDateStart: 'intPlanningDate',
  planningDateEnd: 'intPlanningDateEnd',
  planningHourStart: 'intPlanningHourStart',
  planningHourEnd: 'intPlanningHourEnd',
  planningHour: 'intPlanningHour',
  planningComment: 'intPlanningComment',
  isDone: 'intIsDone',
  doneDateStart: 'intDoneDate',
  doneDateEnd: 'intDoneDateEnd',
  doneHourStart: 'intDoneHourStart',
  doneHourEnd: 'intDoneHourEnd',
  doneHour: 'intDoneHour',
  doneComment: 'intDoneComment',
  doneLongitude: 'intDoneLong',
  doneLatittude: 'intDoneLat',
  doneLocalisationMethod: 'intDoneLocM',
  editDate: 'intModifOn',
  isActif: 'intOn',
  sendMail:'intSendToClient',
}

export default {
  mapField,
  properties,
  mapServerField,
}
