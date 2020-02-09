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
  fkTaskAppliId: 'string',
  fkTaskServerId: {
    type: 'int',
    default: 1,
  },
  fkInterventionAppliId: {
    type: 'string',
  },
  fkInterventionServerId: {
    type: 'int',
    default: 1,
  },
  isPlanningToDo: {
    type: 'int',
    default: 1,
  },
  isDone: {
    type: 'int',
    default: 1,
  },
  planningMinute: {
    type: 'int',
    default: -1,
  },
  doneMinute: {
    type: 'int',
    default: -1,
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
  'fkTaskServerId',
  'fkInterventionServerId',
  'isPlanningToDo',
  'isDone',
  'isActif',
  'editDate',
  'planningMinute',
  'doneMinute',
]

export const mapServerField = {
  id: 'litUUID',
  serverId: 'litId',
  // accountId: 'litAccountId',
  fkTaskAppliId: 'litFkTaskUUID',
  fkTaskServerId: 'litFkTaskId',
  fkInterventionAppliId: 'litFkIntUUID',
  fkInterventionServerId: 'litFkIntId',
  isPlanningToDo: 'litPlanningToDo',
  isDone: 'litIsDone',
  planningMinute: 'litPlanningMinute',
  doneMinute: 'litDoneMinute',
  // comment: 'litComment',
  isActif: 'litOn',
  // synchronizationDate: 'litSynchronizationDate',
  // addDate: 'litAddDate',
  // editDate: 'litEditDate',
  // lastViewDate: 'litLastViewDate',
  // isToSync: 'litIsToSync',
}

export default {
  mapField,
  properties,
  mapServerField,
}
