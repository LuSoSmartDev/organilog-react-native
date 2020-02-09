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
  fkMainAdressesAppliId: {
    type: 'string',
    optional: true, // FIXLATER
  },
  fkMainAdressesServerId: {
    type: 'int',
    optional: true,
  },
  title: {
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
  societe: {
    type: 'string',
    default: '',
  },
  email: {
    type: 'string',
    default: '',
  },
  phoneFixe: {
    type: 'string',
    default: '',
  },
  phoneMobile: {
    type: 'string',
    default: '',
  },
  phonePro: {
    type: 'string',
    default: '',
  },
  fax: {
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
  'fkMainAdressesServerId',
  'title',
  'civilite',
  'prenom',
  'nom',
  'societe',
  'email',
  'phoneFixe',
  'phoneMobile',
  'phonePro',
  'fax',
  'lang',
  'comment',
  'isActif',
]

export const mapFieldDetail = {
  title: 'TITLE',
  civilite: 'CIVILITE',
  prenom: 'PRENOM',
  nom: 'NOM',
  societe: 'SOCIETE',
  email: 'EMAIL',
  phoneFixe: 'PHONE_FIXE',
  phoneMobile: 'PHONE_MOBILE',
  phonePro: 'PHONE_PRO',
  fax: 'FAX',
  comment: 'COMMENT',
  fullname: 'FULLNAME',
  adresse: 'ADDRESS',
}

export const mapServerField = {
  id: 'cId',
  serverId: 'cIdServer',
  code: 'cCode',
  fkAdresseServerId: 'cFkAdresseMainId',
  fkAdresseAppliId: 'cFkAdresseMainAppliId',
  civilite: 'cCivilite',
  title: 'cTitle',
  prenom: 'cPrenom',
  nom: 'cNom',
  societe: 'cSociete',
  email: 'cEmail',
  phoneFixe: 'cPhoneFixe',
  phoneMobileh: 'cPhoneMobile',
  phonePro: 'cPhonePro',
  fax: 'cFax',
  lang: 'cLang',
  comment: 'cComment',
  editDate: 'cModifOn',
  isActif: 'cOn',
}

export default {
  mapField,
  properties,
  mapFieldDetail,
  mapServerField,
}
