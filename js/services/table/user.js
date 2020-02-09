export const properties = {
  id: 'string',
  serverId: {
    type: 'int',
    optional: true,
  },
  accountId: 'int',
  code: {
    type: 'int',
    optional: true,
  },
  fkTeamAppliId: {
    type: 'string',
    optional: true,
  },
  fkTeamServerId: {
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
  login: {
    type: 'string',
    default: '',
  },
  rang: {
    type: 'string',
    default: '',
  },
  civilite: {
    type: 'int',
    default: 1,
  },
  prenom: {
    type: 'string',
    default: '',
  },
  nom: {
    type: 'string',
    default: '',
  },
  email: {
    type: 'string',
    default: '',
  },
  phone: {
    type: 'string',
    default: '',
  },
  lang: {
    type: 'string',
    default: 'fr',
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
  'fkTeamServerId',
  'login',
  'rang',
  'civilite',
  'prenom',
  'nom',
  'email',
  'lang',
  'phone',
  'isActif',
  'synchronizationDate',
]

export default {
  mapField,
  properties,
}
