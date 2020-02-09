export const properties = {

    lId: 'string',
    accountId: 'int', // for account Id 
    lDate: {
      type: 'date',
      default: new Date(),
    },
    lLong: {
      type: 'string',
      default: '0',
    },
    lLat: {
        type: 'string',
        default: '0',
    },
    lAlt: {
        type: 'string',
        default: '',
    },
    isToSync:{
        type: 'int',
        default: 0 // should change default to 1 
    }

  }
  export default {
    properties,
  }
  