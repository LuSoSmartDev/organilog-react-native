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
  filePath: {
    type: 'string',
    default: '',
  },
  fileName: {
    type: 'string',
    default: '',
  },
  fileSize: {
    type: 'int',
    default: 0,
  },
  fileMime: {
    type: 'string',
    optional: true,
  },
  fileData: {
    type: 'string',
    default: '',
  },
  imageWidth: {
    type: 'int',
    default: 0,
  },
  imageHeight: {
    type: 'int',
    default: 0,
  },
  legend: {
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
  'accountId',
  'year',
  'month',
  'fileName',
  'fileSize',
  'fileMime',
  // 'filePath',
  // 'fileData',
  'imageWidth',
  'imageHeight',
  'legend',
  'isFav',
  // 'comment',
  'isActif',
  // 'synchronizationDate',
  // 'addDate',
  'editDate',
  // 'lastViewDate',
  // 'isToSync',
]

export const mapFieldDetail = {
  fileName: 'FILENAME',
  fileSize: 'FILESIZE',
  imageWidth: 'WIDTH',
  imageHeight: 'HEIGHT',
  addDate: 'ADDDATE',
  editDate: 'EDITDATE',
  synchronizationDate: 'SYNCHRONZATIONDATE',
}

export const mapServerField = {
  id: 'mAppId',
  serverId: 'mId',
  code: 'mCode',
  filePath: 'mFilePath',
  fileName: 'mFileName',
  fileSize: 'mFileSize',
  fileData: '',
  imageWidth: 'mImageWidth',
  imageHeight: 'mImageHeight',
  legend: 'mLegend',
  // comment: 'mComment',
  isActif: 'mActif',
  addDate: 'mCreatedOn',
  editDate: 'mModifDate',
}

export default {
  mapField,
  properties,
  mapFieldDetail,
}
