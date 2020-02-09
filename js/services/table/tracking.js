export const properties = {
   tr_id: 'string',
   tr_user_id: { type: 'string', default: '0'},
   tr_date: { type: 'date', default: new Date(), },
   tr_lon: { type: 'string', default: '',},
   tr_lat: { type: 'string', default: '',},
   tr_type: { type: 'string', default: '',},
   tr_item_id: { type: 'string',default: '',},
   tr_nonce:{ type: 'string',default: ''},
   isToSync:{ type: 'int', default: 1},
   isActif: { type: 'int', default: 0} //default is inactive 
  }
  export default { properties }
 