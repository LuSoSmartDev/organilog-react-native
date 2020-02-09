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
  fkProductId: 'string',
  fkProductServerId: {
    type: 'int',
    optional: true,
    default: 0,
  },
  fkInterventionAppliId: {
    type: 'string',
  },
  fkInterventionServerId: {
    type: 'int',
    optional: true,
    default: 0,
  },
  quantity: {
    type: 'string',
    optional: true,
    default: '',
  },
  position: {
    type: 'int',
    optional: true,
    default: 0,
  },
  // addition fields
  productName: {
    type: 'string',
    optional: true,
    default: '',
  },
  isPaid: {
    type: 'int',
    optional: true,
    default: 0,
  },
  amountPaid: {
    type: 'float',
    optional: true,
    default: 0,
  },
  currency: {
    type: 'string',
    optional: true,
    default: '€',
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
    type: 'string',
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
  'fkProductServerId',
  'fkInterventionServerId',
  'quantity',
  'position',
  'isActif',
  'synchronizationDate',
  'fkProductServerId',
  '',
  'productName'
]

export const mapServerField = {
  id: 'lipId',
  serverId: 'lipIdServer',
  fkProductServerId: 'lipFkProductId',
  fkInterventionAppliId: 'lipFkIntAppliId',
  fkInterventionServerId: 'lipFkIntId',
  quantity: 'lipQty',
  // position: 'lip_position',
  isActif: 'lipOn'
}

export default {
  mapField,
  properties,
  mapServerField,
}
