import {
  parseDateFromUnixTime,
} from '../utils/transform.js'

export const properties = {
  id: 'string',
  serverId: {
    type: 'int',
    default: 0,
  },
  companyId: {
    type: 'int',
    optional: true,
  },
  accountId: {
    type: 'int',
    optional: true,
  },
  codeId: {
    type: 'int',
    optional: true,
  },
  code: {
    type: 'string',
    optional: true,
  },
  codeComptable: {
    type: 'int',
    optional: true,
  },
  nom: {
    type: 'string',
    default: '',
    optional: true,
  },
  supplier: {
    type: 'string',
    default: '',
    optional: true,
  },
  price: { // without tax
    type: 'string',
    optional: true,
    default: '0.0',
  },
  priceTax: { // with tax
    type: 'string',
    optional: true,
    default: '0.0',
  },
  tax: {
    type: 'string',
    optional: true,
    default: '0.0',
  },
  comment: {
    type: 'string',
    optional: true,
    default: '',
  },
  // other
  purchase_pu_ht: {
    type: 'string',
    optional: true,
    default: '0.0',
  },
  purchase_pu_ttc: {
    type: 'string',
    optional: true,
    default: '0.0',
  },
  purchase_tx_tax: {
    type: 'string',
    optional: true,
    default: '0.0',
  },
  qty: {
    type: 'string',
    optional: true,
    default: '0',
  },
  qty_min_alert: {
    type: 'string',
    optional: true,
    default: '0',
  },
  qty_sold: {
    type: 'string',
    optional: true,
    default: '0',
  },
  is_unlimited: {
    type: 'string',
    optional: true,
    default: '1',
  },
  is_qty_restricted: {
    type: 'string',
    optional: true,
    default: '1',
  },
  currency: {
    type: 'string',
    optional: true,
    default: '€',
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
  isToSync: {
    type: 'int',
    default: 0,
  },
}

export const mapField = [ // sync product
  'addDate',
  'serverId',
  'codeId',
  'nom',
  'code',
  'supplier',
  'comment',
  'purchase_pu_ht',
  'purchase_pu_ttc',
  'purchase_tx_tax',
  'price',
  'priceTax',
  'tax',
  'qty',
  'qty_min_alert',
  'qty_sold',
  'is_unlimited',
  'is_qty_restricted',
  'isActif',
  'synchronizationDate'
]

export const mapFieldSearch = [ // find product from server
  'addDate',
  'serverId',
  'codeId',
  'nom',
  'code',
  'codeComptable',
  'price',
  'priceTax',
  'tax',
  'comment',
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
