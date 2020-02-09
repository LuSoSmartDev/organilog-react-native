import moment from 'moment'
import uuid from 'uuid'
import I18n from 'react-native-i18n'
import realm from './table'
import { mapField, mapServerField } from './table/intervention'
import { parseDateFromUnixTime } from './utils/transform.js'
import SEClient from './client'
import SEAddress from './address'
import SEMediaLink from './mediaLink'
import SELinkInterventionTask from './linkInterventionTask'
import SeUniteItem from './uniteItem'
import SEUniteLink from './uniteLink'
import ServiceLinkProduct from './LinkInterventionProduct'
import SEUser from './user'
import Setting from '../mobxs/setting'
import UserMobx from '../mobxs/user'
import InterventionMobx from '../mobxs/intervention'
import SVMediaLink from '../services/mediaLink'
import auth from './auth';
import intervention from '../mobxs/intervention';
import AddressMobx from '../mobxs/address';
import ClientMobx from '../mobxs/client';

class InterventionServices {

  list
  constructor() {
    this.realm = realm
  }

  async fetch(accountId) {
    console.log('FetchIntervention >>> Start')
    if (!accountId || accountId === 0)
      return Promise.reject({ success: false, message: 'Required a account' })
    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject({ success: false, message: 'Realm is not connect' })
      } else {
        const { currentUser } = UserMobx;
        //
        let localClients = {}
        if (ClientMobx.isNeedReloadDataReference()) {
          console.log('NeedReloadDataClient')
          localClients = this.realm.objects('Clients')
            .filtered(`accountId = ${accountId}`)
            .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})
          ClientMobx.setListReferences(localClients, false)
        } else {
          localClients = ClientMobx.listReferences
        }
        //
        let localAddresses = {}
        if (AddressMobx.isNeedReloadDataReference()) {
          console.log('NeedReloadDataAddress')
          localAddresses = this.realm.objects('Addresses')
            .filtered(`accountId = ${accountId}`)
            .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})
          AddressMobx.setListReferences(localAddresses, false)
        } else {
          localAddresses = AddressMobx.listReferences
        }
        //
        const UnSorttedIntevention = this.realm
          .objects('Interventions')
          .filtered(`accountId = ${accountId} AND fkClientServerId != null  AND isActif = 1 AND (((fkUserAppliId = '' OR fkUserAppliId = null) AND fkUserServerlId != 0) OR fkUserAppliId = "${currentUser.u_uuid}")`)
          // .filtered(`accountId = ${accountId} AND isActif = 1`)
          .sorted('doneHourStart', false)
        const AllIntervention = UnSorttedIntevention.sorted(['doneHourStart', 'planningHourStart'])

        const Interventions = AllIntervention.reduce(
          (obj, item) => {
            const data = obj
            const intervention = item
            let byDate = moment(item.addDate, 'X').format('YYYY-MM-DD')
            if (item.isDone == 1) {
              if (item.doneDateEnd) {
                byDate = moment(item.doneDateEnd, 'X').format('YYYY-MM-DD')
              } else if (item.doneDateStart) {
                byDate = moment(item.doneDateStart, 'X').format('YYYY-MM-DD')
              }
            } else {
              if (item.planningDateEnd) {
                byDate = moment(item.planningDateEnd, 'X').format('YYYY-MM-DD')
              } else if (item.planningDateStart) {
                byDate = moment(item.planningDateStart, 'X').format('YYYY-MM-DD')
              }
            }
            // intervention.client = localClients[intervention.fkClientAppliId]
            // intervention.address = localAddresses[intervention.fkAdresseAppliId]
            intervention.client = localClients[intervention.fkClientServerId]
            intervention.address = localAddresses[intervention.fkAdresseServerId]
            intervention.linkInterventionTasks = this.linkInterventionTasks(
              intervention
            )
            intervention.uniteLinks = this.linkUnites(intervention, accountId)
            intervention.linkProducts = this.linkProducts(intervention, accountId)
            console.log('FetchLinkProduct : ' + JSON.stringify(intervention.linkProducts))
            data.byDate[byDate] = data.byDate[byDate] || {}

            data.byDate[byDate][intervention.id] = intervention
            data.byId[intervention.id] = intervention

            return data
          },
          { byDate: {}, byId: {} }
        )
        resolve(Interventions)
      }
    })
  }

  async fetchUnFinish(accountId) {
    console.log('FetchInterventionUnFinish >>> Start')
    if (!accountId || accountId === 0)
      return Promise.reject({ success: false, message: 'Required a account' })
    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject({ success: false, message: 'Realm is not connect' })
      } else {
        const { currentUser } = UserMobx;
        //
        let localClients = {}
        if (ClientMobx.isNeedReloadDataReference()) {
          console.log('NeedReloadDataClient')
          localClients = this.realm.objects('Clients')
            .filtered(`accountId = ${accountId}`)
            .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})
          ClientMobx.setListReferences(localClients, false)
        } else {
          localClients = ClientMobx.listReferences
        }
        //
        let localAddresses = {}
        if (AddressMobx.isNeedReloadDataReference()) {
          console.log('NeedReloadDataAddress')
          localAddresses = this.realm.objects('Addresses')
            .filtered(`accountId = ${accountId}`)
            .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})
          AddressMobx.setListReferences(localAddresses, false)
        } else {
          localAddresses = AddressMobx.listReferences
        }
        //
        const UnSorttedIntevention = this.realm
          .objects('Interventions')
          // .filtered(`accountId = ${accountId} AND isDone != 1 AND isActif = 1 AND (fkUserServerlId = "${accountId}" OR fkUserAppliId = "${currentUser.u_uuid}")`)
          .filtered(`accountId = ${accountId} AND fkClientServerId != null  AND isActif = 1 AND isDone != 1 AND fkUserServerlId != 0 AND (((fkUserAppliId = '' OR fkUserAppliId = null)) OR fkUserAppliId = "${currentUser.u_uuid}")`)
        // .filtered(`accountId = ${accountId} AND isDone != 1 AND isActif = 1`)

        const AllIntervention = UnSorttedIntevention.sorted('planningHourStart')
        console.log('AllIntervention unfinished ' + AllIntervention.length)

        const Interventions = AllIntervention.reduce(
          (obj, item) => {
            const data = obj
            const intervention = item
            let byDate = moment(item.addDate, 'X').format('YYYY-MM-DD')
            if (item.planningDateEnd) {
              byDate = moment(item.planningDateEnd, 'X').format('YYYY-MM-DD')
            } else if (item.planningDateStart) {
              byDate = moment(item.planningDateStart, 'X').format('YYYY-MM-DD')
            }

            // intervention.client = localClients[intervention.fkClientAppliId]
            // intervention.address = localAddresses[intervention.fkAdresseAppliId]
            intervention.client = localClients[intervention.fkClientServerId]
            intervention.address = localAddresses[intervention.fkAdresseServerId]
            intervention.linkInterventionTasks = this.linkInterventionTasks(
              intervention
            )
            intervention.uniteLinks = this.linkUnites(intervention, accountId)
            intervention.linkProducts = this.linkProducts(intervention, accountId)
            data.byDate[byDate] = data.byDate[byDate] || {}


            data.byDate[byDate][intervention.id] = intervention

            return data
          },
          { byDate: {} }
        )
        resolve(Interventions)
      }
    })
  }

  async fetchNonAssign(accountId, companyID = 0) {
    console.log('FetchInterventionNonAssign >>> Start')
    console.log('======accountId=====:' + accountId);
    if (!companyID || companyID === 0) {
      companyID = UserMobx.currentUser.u_fk_account_id;
    }

    return new Promise((resolve, reject) => {

      if (!this.realm) {
        reject({ success: false, message: 'Realm is not connect' })
      } else {
        const { currentUser } = UserMobx;
        //
        let localClients = {}
        if (ClientMobx.isNeedReloadDataReference()) {
          console.log('NeedReloadDataClient')
          localClients = this.realm.objects('Clients')
            .filtered(`accountId = ${accountId}`)
            .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})
          ClientMobx.setListReferences(localClients, false)
        } else {
          localClients = ClientMobx.listReferences
        }
        //
        let localAddresses = {}
        if (AddressMobx.isNeedReloadDataReference()) {
          console.log('NeedReloadDataAddress')
          localAddresses = this.realm.objects('Addresses')
            .filtered(`accountId = ${accountId}`)
            .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})
          AddressMobx.setListReferences(localAddresses, false)
        } else {
          localAddresses = AddressMobx.listReferences
        }
        //
        const UnSorttedIntevention = this.realm
          .objects('Interventions')
          .filtered(`accountId = ${companyID} AND fkClientServerId != null AND isActif = 1 AND (fkUserServerlId = 0 OR fkUserServerlId = null)`)
          //.filtered(`accountId = ${accountId}`)
          .sorted('doneHourStart', false)
        const AllIntervention = UnSorttedIntevention.sorted(['editDate', 'addDate'])

        const Interventions = AllIntervention.reduce(
          (obj, item) => {
            const data = obj
            const intervention = item
            let byDate = moment(item.addDate, 'X').format('YYYY-MM-DD')
            if (item.isDone == 1) {
              if (item.doneDateEnd) {
                byDate = moment(item.doneDateEnd, 'X').format('YYYY-MM-DD')
              } else if (item.doneDateStart) {
                byDate = moment(item.doneDateStart, 'X').format('YYYY-MM-DD')
              }
            } else {
              if (item.planningDateEnd) {
                byDate = moment(item.planningDateEnd, 'X').format('YYYY-MM-DD')
              } else if (item.planningDateStart) {
                byDate = moment(item.planningDateStart, 'X').format('YYYY-MM-DD')
              }
            }
            // intervention.client = localClients[intervention.fkClientAppliId]
            // intervention.address = localAddresses[intervention.fkAdresseAppliId]
            intervention.client = localClients[intervention.fkClientServerId]
            intervention.address = localAddresses[intervention.fkAdresseServerId]
            intervention.linkInterventionTasks = this.linkInterventionTasks(
              intervention
            )
            intervention.uniteLinks = this.linkUnites(intervention, accountId)
            intervention.linkProducts = this.linkProducts(intervention, accountId)
            data.byDate[byDate] = data.byDate[byDate] || {}
            // console.log('log1 1')
            data.byDate[byDate][intervention.id] = intervention
            data.byId[intervention.id] = intervention
            // console.log('log1 2')
            return data
          },
          { byDate: {}, byId: {} }
        )

        resolve(Interventions)
      }
    })
  }


  async fetchByClientAndAddress(accountId, client, address) {
    if (!accountId || accountId === 0) return null;
    // return Promise.reject({ success: false, message: 'fetchByClientAndAddress - Required a account' })
    return new Promise((resolve, reject) => {
      if (!this.realm) {
        // reject({ success: false, message: 'fetchByClientAndAddress - Realm is not connect' })
        return null;
      } else {
        const { currentUser } = UserMobx;

        if (client == undefined)
          return null;
        conditionQuery = `accountId = ${accountId} AND isActif = 1 AND (fkUserAppliId = '' OR fkUserAppliId = null OR fkUserAppliId = "${currentUser.u_uuid}") AND fkClientServerId = ${client.serverId} AND fkAdresseServerId = ${address.serverId}`;
        const UnSorttedIntevention = this.realm
          .objects('Interventions')
          .filtered(conditionQuery)
          .sorted('doneHourStart', false)
        const AllIntervention = UnSorttedIntevention.sorted(['doneHourStart', 'planningHourStart'])
        const Interventions = AllIntervention.map(intervention => {
          intervention.client = client
          intervention.address = address
          intervention.linkInterventionTasks = this.linkInterventionTasks(
            intervention
          )
          intervention.uniteLinks = this.linkUnites(intervention, accountId)
          intervention.linkProducts = this.linkProducts(intervention, accountId)
          return intervention
        }
        )
        resolve(Interventions)
      }
    })
  }

  isRead(id) {
    if (this.realm) {
      this.realm.write(() => {
        this.realm.create(
          'Interventions',
          { isRead: 1, id, isToSync: 1, lastViewDate: new Date() },
          true
        )
      })
    }
  }

  getLastTimeFinishJob(lastTimeFinishJob) {
    try {
      hours = ~~(lastTimeFinishJob / 60);
      minutes = lastTimeFinishJob - hours * 60;
      return this.displayTime(hours) + ':' + this.displayTime(minutes)
    } catch (e) {
      // console.log('getLastTimeFinishJob_Error : ' + e)
    }
  }

  displayTime(val) {
    return (val < 10) ? '0' + val : val;
  }

  toggleDone(intervention, isDone, lastTimeFinishJob) {

    const now = moment(new Date())
    const newData = {
      ...intervention,
      isDone,
      isToSync: 1,
      editDate: now.toDate(),
    }


    if (newData.planningDateStart) {
      newData.planningDateStart = new Date(newData.planningDateStart)
    } else {
      newData.planningDateStart = null
    }
    if (newData.planningDateEnd) {
      newData.planningDateEnd = new Date(newData.planningDateEnd)
    } else {
      newData.planningDateEnd = null
    }
    if (newData.doneDateStart) {
      newData.doneDateStart = new Date(newData.doneDateStart)
    } else {
      newData.doneDateStart = null
    }
    if (newData.doneDateEnd) {
      newData.doneDateEnd = new Date(newData.doneDateEnd)
    } else {
      newData.doneDateEnd = null
    }

    if (isDone == 1) {


      if (!newData.doneDateStart) newData.doneDateStart = now.toDate()
      newData.doneDateEnd = now.toDate()
      if (moment(newData.doneDateEnd).isSameOrBefore(moment(newData.doneDateStart).format('YYYY-MM-DD'), 'day')) {
        newData.doneDateEnd = newData.doneDateStart
      }
      // if (!newData.doneHourStart) newData.doneHourStart = now.format('HH:mm')
      // console.log('lastTimeFinishJob_Pass : ' + lastTimeFinishJob)
      if (lastTimeFinishJob > 0) {
        // if (!newData.doneHourStart) newData.doneHourStart = moment(lastTimeFinishJob).format('HH:mm')
        newData.doneHourStart = this.getLastTimeFinishJob(lastTimeFinishJob)
        // newData.doneHourStart = moment.unix(lastTimeFinishJob / 1000).format('HH:mm')
      } else {
        if (!newData.doneHourStart) newData.doneHourStart = now.format('HH:mm')
      }
      newData.doneHourEnd = now.format('HH:mm')
      const backTime = newData.doneHourStart.split(':')

      newData.doneHour = now
        .subtract({ hours: backTime[0] || 0, minutes: backTime[1] || 0 })
        .format('HH:mm')

      if (intervention.linkInterventionTasks) {
        let linkInterventionTasks = Object.keys(intervention.linkInterventionTasks).map((item) => {
          let temp = { ...intervention.linkInterventionTasks[item] }
          if (!temp.doneMinute || temp.doneMinute == 0) {
            temp.doneMinute = temp.planningMinute;
            temp.planningMinute = 0
            temp.isToSync = 1
            this.realm.write(() => {
              realm.create('LinkInterventionTask', temp, true)
            })
          }
        })
      }

      // newData.doneComment = newData.planningComment // keep current comment
    } else {
      console.log('EditIntervention : 0')
      if (!intervention.id) {
        newData.doneHour = ''
        newData.doneDateEnd = null
        newData.doneHourEnd = ''
        newData.doneComment = ''
      }
      console.log('EditIntervention : 1')
    }
    return new Promise((resolve, reject) => {

      if (!this.realm) {
        reject({ success: false, message: 'ToggleProgressIntervention_Realm is not connectted' })
      } else {
        try {
          this.realm.write(() => {
            console.log('TongleDone' + JSON.stringify(newData))
            const newIntervention = this.realm.create('Interventions', newData, true)

            resolve(newIntervention)
          })
        } catch (e) {

          console.log('tongle done' + e.toString)

          reject({ success: false, message: e.toString() })
        }
      }
    })
  }

  linkInterventionTasks(intervention) {
    if (intervention) {
      return this.realm
        .objects('LinkInterventionTask')
        .filtered(`fkInterventionAppliId = "${intervention.id}" AND isActif = 1`)
    } else {
      return []
    }
  }

  linkUnites(intervention, accountId = '') {
    try {
      if (intervention) {
        conditionQuery = `accountId = ${accountId} AND isActif = 1`
        // console.log('FetchUniteLinkServerId : ' + intervention.serverId)
        if (intervention.serverId) {
          conditionQuery = `accountId = ${accountId} AND isActif = 1 AND (fkColumnAppliId = "${intervention.id}" OR fkColumnServerId = "${intervention.serverId}")`
        } else {
          conditionQuery = `accountId = ${accountId} AND isActif = 1 AND fkColumnAppliId = "${intervention.id}"`
        }
        // console.log('FetchUniteLink (' +intervention.serverId+ ') : ' + conditionQuery)
        uniteLinks = this.realm
          .objects('UniteLinks')
          .filtered(conditionQuery)
        return this.mergeUniteUI(uniteLinks, accountId)
      } else {
        return []
      }
    } catch (e) {
      console.log('FetchLinkUniteOfInterventionError : ' + e)
      return []
    }
  }

  linkProducts(intervention, accountId = '') {
    try {
      if (intervention) {
        conditionQuery = ''
        // console.log('FetchLinkProductIntvServerId : ' + intervention.serverId)
        if (intervention.serverId) {
          conditionQuery = `isActif = 1 AND (fkInterventionAppliId = "${intervention.id}" OR fkInterventionServerId = "${intervention.serverId}")`
        } else {
          conditionQuery = `isActif = 1 AND fkInterventionAppliId = "${intervention.id}"`
        }
        // console.log('FetchLinkProduct (' + intervention.serverId + ') : ' + conditionQuery)
        listProducts = this.realm
          .objects('LinkInterventionProduct')
          .filtered(conditionQuery)
        return this.mergeProductUI(listProducts, accountId)
      } else {
        return []
      }
    } catch (e) {
      console.log('FetchLinkProductOfInterventionError : ' + e)
      return []
    }
  }

  mergeProductUI(linkProducts, accountId = '') {
    // console.log('linkProducts : ' + JSON.stringify(linkProducts))
    objLinkProducts = {}
    if (linkProducts && Object.keys(linkProducts).length > 0) {
      keys = Object.keys(linkProducts);
      for (var i = 0; i < keys.length; i++) {
        item = linkProducts[keys[i]];
        objLinkProducts[keys[i]] = item;
        console.log('LinkProductItem : ' + JSON.stringify(item))
        const product = this.realm
          .objects('Products')
          .filtered(`serverId = "${item.fkProductServerId}" OR id = "${item.fkProductId}"`)
        if (product && Object.keys(product).length > 0) {
          // item['productName'] = product[0]['nom']
          // if (!item.fkProductServerId && product[0]['serverId']) {
          //   item.fkProductServerId = product[0]['serverId']
          // }
          objLinkProducts[keys[i]] = item;
        }
      }
    }
    return objLinkProducts
  }

  mergeUniteUI(uniteLinks, accountId = '') {
    objUniteLinks = {}
    if (uniteLinks && Object.keys(uniteLinks).length > 0) {
      keys = Object.keys(uniteLinks);
      for (var i = 0; i < keys.length; i++) {
        item = uniteLinks[keys[i]];
        const unites = this.realm
          .objects('Unite')
          // .filtered(`id = "${item.fkUniteAppliId}"`)
          .filtered(`id = "${item.fkUniteAppliId}" OR serverId = "${item.fkUniteServerId}"`)
        if (unites && Object.keys(unites).length > 0) {
          // console.log('Unite : ' + unites[0]['serverId'])
          item['UniteTitle'] = unites[0]['nom']
          item['UniteType'] = unites[0]['fieldType']
          item['uniteValueUI'] = item['uniteValue']
          const listUniteItem = this.realm
            .objects('UniteItem')
            .filtered(`accountId = ${accountId} AND uniteServerId = ${unites[0]['serverId']}`)
          if (listUniteItem && Object.keys(listUniteItem).length > 0) {
            uniteValue = ''
            const listKeyUniteItem = listUniteItem.sortKey()
            listKeyUniteItem.map(keyUnite => {
              if (item['uniteValue'] == listUniteItem[keyUnite].serverId) {
                uniteValue += listUniteItem[keyUnite].value
                return;
              }
              uniteValue += listUniteItem[keyUnite].value + ', '
            })
            item['uniteValueUI'] = uniteValue;
          }
          if (item['UniteType'] == 3) {
            if (item['uniteValueUI'] == 1) {
              item['uniteValueUI'] = I18n.t('YES')
            } else if (item['uniteValueUI'] == 1) {
              item['uniteValueUI'] = I18n.t('NO')
            }
          }
          objUniteLinks[keys[i]] = item;
        }
      }
    }
    return objUniteLinks
  }

  update(
    intervention,
    dataSource,
    listUsers,
    listTasks,
    listUnites) {
    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject({ success: false, message: 'Realm is not connect' })
      } else if (!intervention) {
        reject({ success: false, message: 'Date is null' })
      } else {
        try {
          this.realm.write(() => {
            const data = { ...intervention }
            if (data.planningDateStart) {
              data.planningDateStart = new Date(data.planningDateStart)
            } else {
              data.planningDateStart = null
            }
            if (data.planningDateEnd) {
              data.planningDateEnd = new Date(data.planningDateEnd)
            } else {
              data.planningDateEnd = null
            }
            if (data.doneDateStart) {
              data.doneDateStart = new Date(data.doneDateStart)
            } else {
              data.doneDateStart = null
            }
            if (data.doneDateEnd) {
              data.doneDateEnd = new Date(data.doneDateEnd)
            } else {
              data.doneDateEnd = null
            }
            this.updateChildIntervention(data, data.accountId)
            const newIntervention = realm.create('Interventions', data, true)
            if (intervention.address) {
              newIntervention.address = intervention.address
            }
            if (intervention.client) {
              newIntervention.client = intervention.client
            }
            SEMediaLink.dropOldMediaOfIntervention(newIntervention.accountId, newIntervention.id, newIntervention.serverId)
            SEMediaLink.insertList(dataSource, newIntervention.id, newIntervention.serverId)
            // console.log('ReInsertMediaLink : ' + JSON.stringify(dataSource))
            //
            SELinkInterventionTask.dropOldLinkTaskOfIntervention(newIntervention.accountId, newIntervention.id, newIntervention.serverId)
            tasks = SELinkInterventionTask.insertList(listTasks, newIntervention)
            linkProducts = ServiceLinkProduct.insertList(intervention.listCurrentProduct, newIntervention.id)
            //
            SEUniteLink.dropOldLinkUniteOfIntervention(newIntervention.accountId, newIntervention.id, newIntervention.serverId)
            uniteLinks = SEUniteLink.insertList(listUnites, newIntervention.id)
            //
            newIntervention.linkInterventionTasks = tasks//['_55']
            newIntervention.uniteLinks = this.mergeUniteUI(uniteLinks['_55'], newIntervention.accountId)
            newIntervention.linkProducts = this.mergeProductUI(linkProducts['_55'], newIntervention.accountId)
            resolve(newIntervention)
          })
        } catch (e) {
          // console.log('UpdateInterventionError : ' + e)
          reject(e.toString())
        }
      }
    })
  }

  updateSendMail(intervention) {
    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject({ success: false, message: 'updateSendMail - Realm is not connect' })
      } else if (!intervention) {
        reject({ success: false, message: 'updateSendMail - No data Intervention' })
      } else {
        try {
          this.realm.write(() => {
            const data = { ...intervention }
            const newIntervention = realm.create('Interventions', data, true)
            resolve(newIntervention)
          })
        } catch (e) {
          // console.log('ErrorUpdateInterventionSendMail : ' + e)
          reject(e.toString())
        }
      }
    })
  }

  insert(intervention,
    clientName,
    objAddress,
    dataSource,
    listUsers,
    listTasks,
    listUnites) {
    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject({ success: false, message: 'Realm is not connected' })
      } else if (!intervention) {
        reject({ success: false, message: 'Information of Intervention not allow null' })
      } else {
        this.realm.write(() => {
          let client, address
          index = 0;
          idParent = ''
          const listIntervention = listUsers.map(user => {
            const now = new Date()
            const data = {
              ...intervention,
              id: uuid.v4(),
              addDate: now,
              editDate: now,
              isToSync: 1,
              code: null,
              nom: intervention.nom, // || user.name,
            }
            let newFkAdresseAppliId = null
            if (!data.fkAdresseAppliId) {
              newFkAdresseAppliId = uuid.v4()
            }
            if (!data.fkClientAppliId) {
              const clientData = {
                id: uuid.v4(),
                accountId: data.accountId,
                title: clientName,
                addDate: now,
                editDate: now,
                isToSync: 1,
                fkMainAdressesAppliId: data.fkAdresseAppliId || newFkAdresseAppliId, // if fkAdresseAppliId isn't set, use newly generated id
              }
              client = realm.create('Clients', clientData)
              data.fkClientAppliId = client.id
              data.fkClientServerId = client.serverId
            } else {
              client = realm
                .objects('Clients')
                .filtered(`id = "${data.fkClientAppliId}"`)[0]
              if (!client) {
                return reject({
                  success: false,
                  message: 'Invalid client id: ' + data.fkClientAppliId,
                })
              } else {
                data.fkClientServerId = client.serverId
              }
            }

            if (!data.fkAdresseAppliId) {
              const addressData = {
                ...objAddress,
                id: newFkAdresseAppliId,
                accountId: data.accountId,
                addDate: now,
                editDate: now,
                isToSync: 1,
                fkClientAppliId: data.fkClientAppliId,
              }
              address = realm.create('Addresses', addressData)
              data.fkAdresseAppliId = address.id
              data.fkAdresseServerId = address.serverId
            } else {
              address = realm
                .objects('Addresses')
                .filtered(`id = "${data.fkAdresseAppliId}"`)[0]
              if (!address) {
                return reject({
                  success: false,
                  message:
                    'Invalid fkAdresseAppliId id: ' + data.fkAdresseAppliId,
                })
              } else {
                data.fkAdresseServerId = address.serverId
              }
            }
            if (!user.id) {
              // if (!intervention.fkUserAppliId) {
              const userData = {
                id: uuid.v4(),
                serverId: user.serverId,
                nom: user.name,
                accountId: data.accountId,
                addDate: now,
                editDate: now,
                isToSync: 1,
              }
              const newUser = realm.create('Users', userData)
              if (index > 0) {
                data.fkUserAppliId = newUser.id
                data.fkUserServerId = newUser.serverId
              }
            } else {
              if (index > 0) {
                data.fkUserAppliId = user.id
                data.fkUserServerId = intervention.fkUserAppliId
              }
            }
            // console.log('Parent : ' + data.fkParentApplId)
            // console.log('NeedAddParent : ' + (listUsers && listUsers.length > 1))
            if (listUsers && listUsers.length > 1) {
              if (index > 0) {
                data.fkParentApplId = idParent
              }
            }
            //
            if (data.planningDateStart) {
              data.planningDateStart = new Date(data.planningDateStart)
            } else {
              data.planningDateStart = null
            }
            if (data.planningDateEnd) {
              data.planningDateEnd = new Date(data.planningDateEnd)
            } else {
              data.planningDateEnd = null
            }
            if (data.doneDateStart) {
              data.doneDateStart = new Date(data.doneDateStart)
            } else {
              data.doneDateStart = null
            }
            if (data.doneDateEnd) {
              data.doneDateEnd = new Date(data.doneDateEnd)
            } else {
              data.doneDateEnd = null
            }

            const newIntervention = realm.create('Interventions', data)
            console.log("DATANEW" + JSON.stringify(newIntervention))
            //
            newIntervention.client = client
            newIntervention.address = address
            //
            if (index == 0) {
              idParent = newIntervention.id;
              index++;
            }
            SEMediaLink.insertList(dataSource, newIntervention.id)
            tasks = SELinkInterventionTask.insertList(listTasks, newIntervention)
            uniteLinks = SEUniteLink.insertList(listUnites, newIntervention.id)
            linkProducts = ServiceLinkProduct.insertList(intervention.listCurrentProduct, newIntervention.id)
            //
            newIntervention.linkInterventionTasks = tasks['_55']
            newIntervention.uniteLinks = this.mergeUniteUI(uniteLinks['_55'], newIntervention.accountId)
            newIntervention.linkProducts = linkProducts['_55']
            return newIntervention
          })


          resolve(listIntervention.filter(itv => !itv.fkUserAppliId))
        })
      }
    })
  }

  onEdit(intervention) {
    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject({ success: false, message: 'Realm not connectted' })
      } else if (!intervention) {
        reject({ success: false, message: 'Intervention is null / empty' })
      } else {
        try {
          this.realm.write(() => {
            const data = { ...intervention, isToSync: 1 }
            data.editDate = new Date()
            resolve(realm.create('Interventions', data, true))
          })
        } catch (e) {
          reject(e.toString())
        }
      }
    })
  }
  onAssign(intervention) {
    return new Promise((resolve, reject) => {
      if (!this.realm) {
        reject({ success: false, message: 'Realm not connectted' })
      } else if (!intervention) {
        reject({ success: false, message: 'Intervention is null / empty' })
      } else {
        try {
          this.realm.write(() => {
            const data = { ...intervention, isToSync: 0 }
            data.editDate = new Date()
            resolve(realm.create('Interventions', data, true))
          })
        } catch (e) {
          reject(e.toString())
        }
      }
    })
  }

  getListUserAddedOfIntervention(Intervention, accountId) {
    try {
      if (Intervention) {
        conditionAppId = '';
        if (Intervention.id) {
          conditionAppId = `fkParentApplId = "${Intervention.id}"`
        }
        conditionServerId = '';
        if (Intervention.serverId) {
          conditionServerId = `fkParentServerlId = ${Intervention.serverId}`
        }
        conditionQuery = '';
        if (conditionAppId && conditionServerId) {
          conditionQuery = '(' + conditionAppId + ' OR ' + conditionServerId + ')'
        } else if (conditionAppId) {
          conditionQuery = conditionAppId
        } else if (conditionServerId) {
          conditionQuery = conditionServerId
        }
        if (conditionQuery) {
          conditionQuery = `accountId = ${accountId} AND isActif = 1 AND ${conditionQuery}`
          const localChildInterventions = this.realm
            .objects('Interventions')
            .filtered(conditionQuery)
          // update child data
          objChildIntervention = []
          if (localChildInterventions && Object.keys(localChildInterventions).length > 0) {
            keys = Object.keys(localChildInterventions);
            for (var i = 0; i < keys.length; i++) {
              itemIntervention = localChildInterventions[keys[i]];
              const listUserAdded = this.realm
                .objects('Users')
                .filtered(`isActif = 1 AND (id = "${itemIntervention.fkUserAppliId}" OR serverId = ${itemIntervention.fkUserServerlId})`)
              if (listUserAdded && Object.keys(listUserAdded).length > 0) {
                itemUserAdded = {}
                dataItemUser = listUserAdded[0]
                itemUserAdded['id'] = dataItemUser['id']
                itemUserAdded['serverId'] = dataItemUser['serverId']
                itemUserAdded['nom'] = dataItemUser['nom']
                itemUserAdded['prenom'] = dataItemUser['prenom']
                objChildIntervention[i] = itemUserAdded
              }
            }
          }
          return objChildIntervention
        } else {
          return []
        }
      } else {
        return []
      }
    } catch (e) {
      // console.log('ErrorGetListUserAddedOfIntervention : ' + e)
      return []
    }
  }

  async updateChildIntervention(Intervention, accountId) {
    try {
      conditionAppId = '';
      if (Intervention.id) {
        conditionAppId = `fkParentApplId = "${Intervention.id}"`
      }
      conditionServerId = '';
      if (Intervention.serverId) {
        conditionServerId = `fkParentServerlId = ${Intervention.serverId}`
      }
      conditionQuery = '';
      if (conditionAppId && conditionServerId) {
        conditionQuery = '(' + conditionAppId + ' OR ' + conditionServerId + ')'
      } else if (conditionAppId) {
        conditionQuery = conditionAppId
      } else if (conditionServerId) {
        conditionQuery = conditionServerId
      }
      if (conditionQuery) {
        const companyID = UserMobx.currentUser.u_fk_account_id
        conditionQuery = `(accountId = ${accountId} OR accountId = ${companyID}) AND ${conditionQuery}`
        // console.log('FindingChildInterventionWith : ' + conditionQuery)
        const localChildInterventions = this.realm
          .objects('Interventions')
          .filtered(conditionQuery)
          .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})
        // update child data
        if (localChildInterventions) {
          localChildKeys = Object.keys(localChildInterventions);
          localChildKeys.map(key => {
            childItem = localChildInterventions[key]
            try {
              childItem.isToSync = 1;
              childItem.nom = Intervention.nom
              try {
                childItem.isActif = Intervention.isActif
                childItem.isDone = Intervention.isDone
                childItem.priority = Intervention.priority
                if (Intervention.sendMail || Intervention.sendMail === 0) {
                  childItem.sendMail = Intervention.sendMail
                }
              } catch (e) {

              }
              //
              try {
                childItem.planningDateStart = Intervention.planningDateStart
                childItem.planningDateEnd = Intervention.planningDateEnd
                childItem.planningHourStart = Intervention.planningHourStart
                childItem.planningHourEnd = Intervention.planningHourEnd
                childItem.planningHour = Intervention.planningHour
                childItem.planningComment = Intervention.planningComment
              } catch (e) {

              }
              //
              try {
                childItem.doneDateStart = Intervention.doneDateStart
                childItem.doneDateEnd = Intervention.doneDateEnd
                childItem.doneHourStart = Intervention.doneHourStart
                childItem.doneHourEnd = Intervention.doneHourEnd
                childItem.doneHour = Intervention.doneHour
                childItem.doneComment = Intervention.doneComment
              } catch (e) {

              }
              //
              try {
                childItem.fkClientAppliId = Intervention.fkClientServerId
                childItem.fkAdresseAppliId = Intervention.fkAdresseServerId
                childItem.fkCheminAppliId = Intervention.fkCheminServerId
                childItem.fkFilialeAppliId = Intervention.fkFilialeServerId
              } catch (e) {

              }
              // this.realm.write(() => {
              //   this.realm.create('Interventions', childItem, true)
              // })
              this.realm.create('Interventions', childItem, true)
            } catch (e) {
              // console.log('ErrorResetDataChild : ' + e)
            }
          })
        }
      }
    } catch (e) {
      // console.log('ErrorUpdateChildren : ' + e)
    }
  }

  syncFromServer(interventions, accountId, companyID = 0) {
    // console.log('server int: ' + JSON.stringify(interventions));

    if (!interventions || interventions.length === 0)
      return Promise.reject({ success: false, message: 'SyncInterventionFromServer - No Intervention need sync' })
    // console.log('SyncInterventionFromServer (' + interventions.length + ')')
    if (InterventionMobx.list) {

    }
    const localInterventions = this.realm
      .objects('Interventions')
      .filtered(`(accountId = ${accountId} OR accountId = ${companyID}) AND serverId != 0`)
      .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})
    // console.log('Current Local Intervention : ' + JSON.stringify(localInterventions));
    //
    var localAddresses = {}
    if (AddressMobx.isNeedReloadDataReference()) {
      localAddresses = this.realm
        .objects('Addresses')
        .filtered(`accountId = ${accountId} AND serverId != 0`)
        .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})
      AddressMobx.setListReferences(localAddresses, false)
    } else {
      localAddresses = AddressMobx.listReferences
    }
    //
    var localClients = {}
    if (ClientMobx.isNeedReloadDataReference()) {
      localClients = this.realm
        .objects('Clients')
        .filtered(`accountId = ${accountId} AND serverId != 0`)
        .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})
      ClientMobx.setListReferences(localClients, false)
    } else {
      localClients = ClientMobx.listReferences
    }
    //
    const localChemins = this.realm
      .objects('Chemins')
      .filtered(`accountId = ${accountId} AND serverId != 0`)
      .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})
    //
    var localUsers = {}
    if (UserMobx.isNeedReloadDataReference()) {
      localUsers = this.realm
        .objects('Users')
        .filtered(`accountId = ${accountId} AND serverId != 0`)
        .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})
      UserMobx.setListReferences(localUsers, false)
    } else {
      localUsers = UserMobx.listReferences
    }
    //
    const localFiliales = this.realm
      .objects('Filiales')
      .filtered(`accountId = ${accountId} AND serverId != 0`)
      .reduce((obj, item) => ({ ...obj, [item.serverId]: item }), {})
    const dateformat = require('dateformat');
    lastSyncTime = '';
    const lastSync = Setting.getLastSync();
    if (lastSync && !isNaN(lastSync.value)) {
      lastSyncTime = lastSync.value;
    }
    return Promise.all(
      interventions.map(item => {
        const Intervention = Object.keys(item).reduce((obj, key) => {
          if (!item[key] || !mapField[key]) return obj
          return { ...obj, [mapField[key]]: item[key] }
        }, {})
        if (!Intervention) {
          return;
        }
        if (!Intervention.isActif) {
          Intervention.isActif = 0;
        }
        if (item.k) {
          // Intervention['InterventionId'] = item.k;
          Intervention.id = item.k;
        } else {
          // Intervention['InterventionId'] = uuid.v4();
          Intervention.id = uuid.v4();
        }
        if (Intervention.planningDateStart) {
          Intervention.planningDateStart = moment(Intervention.planningDateStart).format('YYYY-MM-DD');
        } else {
          Intervention.planningDateStart = moment().format('YYYY-MM-DD');
        }
        Intervention.planningDateStart = new Date(Intervention.planningDateStart);
        //
        if (!Intervention.planningDateEnd) {
          Intervention.planningDateEnd = moment().format('YYYY-MM-DD');
        }
        Intervention.planningDateEnd = new Date(Intervention.planningDateEnd);
        // if (Intervention.editDate && !Intervention.addDate) {
        //   Intervention.addDate = moment(Intervention.editDate).format('X')
        // }

        // Intervention.id = Intervention.InterventionId;
        // Intervention.fkClientAppliId = Intervention.InterventionId;
        //
        // if ( accountId == lastSync.accountId) {
        // console.log('AddedDate : ' + Intervention.addDate)
        // console.log('EdittedDate : ' + Intervention.editDate)
        modified = Math.max(Intervention.addDate, moment(Intervention.editDate).format('X'));
        // console.log('modified : ' + modified)
        // console.log('lastSyncTime : ' + lastSyncTime)
        const dateTime = Date.now();
        const timestamp = Math.floor(dateTime / 1000);
        lastSyncTime = Math.max(modified, timestamp);
        // console.log('lastSyncTime_2 : ' + lastSyncTime)
        // }
        ((obj) => {
          // try {
          //   obj.addDate = new Date(obj.addDate * 1000);
          //   if (isNaN(obj.addDate.getTime())) {
          //     obj.addDate = new Date()
          //   }
          // }
          // catch (e) {
          //   obj.addDate = new Date()
          // }
          obj.addDate = parseDateFromUnixTime(obj.addDate)

          try {
            obj.doneDateStart = new Date(obj.doneDateStart);
            if (isNaN(obj.doneDateStart.getTime())) {
              obj.doneDateStart = null;
            }
          }
          catch (e) {
            obj.doneDateStart = null;
          }
          try {
            obj.doneDateEnd = new Date(obj.doneDateEnd);
            if (isNaN(obj.doneDateEnd.getTime())) {
              obj.doneDateEnd = null;
            }
          }
          catch (e) {
            obj.doneDateEnd = null;
          }
          try {
            obj.editDate = new Date(obj.editDate);
            if (isNaN(obj.editDate.getTime())) {
              obj.editDate = new Date();
            }
          }
          catch (e) {
            obj.editDate = new Date();
          }
        })(Intervention);
        if (Intervention.priority) {
          Intervention.priority = parseInt(Intervention.priority, 10)
        }
        Intervention.fkClientAppliId = Intervention.fkClientServerId ? ((localClients[Intervention.fkClientServerId] || {}).id || "") : ""
        Intervention.fkAdresseAppliId = Intervention.fkAdresseServerId ? ((localAddresses[Intervention.fkAdresseServerId] || {}).id || "") : ""
        Intervention.fkUserAppliId = Intervention.fkUserServerlId ? ((localUsers[Intervention.fkUserServerlId] || {}).id || "") : "0"
        Intervention.fkCheminAppliId = Intervention.fkCheminServerId ? ((localChemins[Intervention.fkCheminServerId] || {}).id || "") : ""
        Intervention.fkFilialeAppliId = Intervention.fkFilialeServerId ? ((localFiliales[Intervention.fkFilialeServerId] || {}).id || "") : ""
        Intervention.fkParentApplId = Intervention.fkParentServerlId ? ((localInterventions[Intervention.fkParentServerlId] || {}).id || "") : ""
        //
        //fkUserServerlId == 0 then accountID = companyID 


        const currentInterventions = localInterventions[Intervention.serverId]

        //console.log('allLocalInterventions =>' + Intervention.serverId)
        //console.log('allLocalInterventions =>' + JSON.stringify(Object.keys(allLocalInterventions)) )

        return new Promise((resolve, reject) => {
          try {

            if (true) {
              // if (!currentInterventions) {
              // console.log('=========Vao1=========')
              // Intervention.id = uuid.v4();
              // Intervention.id = Intervention.InterventionId;


              if (Intervention.fkUserServerlId == undefined || Intervention.fkUserServerlId == 0 && Intervention.fkUserServerlId != "0" || Intervention.fkUserServerlId == null) {
                Intervention.accountId = parseInt(companyID);
                Intervention.fkUserServerlId = 0;
              } else {
                Intervention.accountId = parseInt(accountId, 10)
              }

              // if (Intervention.planningDateStart) {
              //   Intervention.planningDateStart = moment(Intervention.planningDateStart).format('YYYY-MM-DD');
              // } else {
              //   Intervention.planningDateStart = moment().format('YYYY-MM-DD');
              // }
              // Intervention.planningDateStart = new Date(Intervention.planningDateStart);
              // //
              // if (!Intervention.planningDateEnd) {
              //   Intervention.planningDateEnd = moment().format('YYYY-MM-DD');
              // }
              // Intervention.planningDateEnd = new Date(Intervention.planningDateEnd);
              // if (Intervention.editDate && !Intervention.addDate) {
              //   Intervention.addDate = moment(Intervention.editDate).format('X')
              // }
              // if (!Intervention.addDate) {
              //   Intervention.addDate = moment(Intervention.planningDateStart).format('X');
              // }
              // if (Intervention.priority) {
              //   Intervention.priority = parseInt(Intervention.priority, 10)
              // }
              // Intervention.fkClientAppliId = Intervention.fkClientServerId ? ((localClients[Intervention.fkClientServerId] || {}).id || "") : ""
              // Intervention.fkAdresseAppliId = Intervention.fkAdresseServerId ? ((localAddresses[Intervention.fkAdresseServerId] || {}).id || "") : ""
              // Intervention.fkUserAppliId = Intervention.fkUserServerlId ? ((localUsers[Intervention.fkUserServerlId] || {}).id || "") : ""
              // Intervention.fkCheminAppliId = Intervention.fkCheminServerId ? ((localChemins[Intervention.fkCheminServerId] || {}).id || "") : ""
              // Intervention.fkFilialeAppliId = Intervention.fkFilialeServerId ? ((localFiliales[Intervention.fkFilialeServerId] || {}).id || "") : ""
              // Intervention.fkParentApplId = Intervention.fkParentServerlId ? ((localInterventions[Intervention.fkParentServerlId] || {}).id || "") : ""
              Intervention.synchronizationDate = new Date();
              // ((obj) => {
              //   try {
              //     obj.addDate = new Date(obj.addDate * 1000);
              //     if (isNaN(obj.addDate.getTime())) {
              //       obj.addDate = new Date()
              //     }
              //   }
              //   catch (e) {
              //     obj.addDate = new Date()
              //   }

              //   try {
              //     obj.doneDateStart = new Date(obj.doneDateStart);
              //     if (isNaN(obj.doneDateStart.getTime())) {
              //       obj.doneDateStart = null;
              //     }
              //   }
              //   catch (e) {
              //     obj.doneDateStart = null;
              //   }

              //   try {
              //     obj.doneDateEnd = new Date(obj.doneDateEnd);
              //     if (isNaN(obj.doneDateEnd.getTime())) {
              //       obj.doneDateEnd = null;
              //     }
              //   }
              //   catch (e) {
              //     obj.doneDateEnd = null;
              //   }

              //   try {
              //     obj.editDate = new Date(obj.editDate);
              //     if (isNaN(obj.editDate.getTime())) {
              //       obj.editDate = new Date();
              //     }
              //   }
              //   catch (e) {
              //     obj.editDate = new Date();
              //   }
              // })(Intervention);

              // const currentIntervention = allLocalInterventions[Intervention.serverId]
              // if (!currentIntervention) {
              //   this.realm.write(() => {
              //     this.realm.create('Interventions', Intervention)
              //     this.updateChildIntervention(Intervention, accountId);
              //   })
              // }else{
              //   const combineIntervention = {
              //     ...Intervention,
              //     ...currentIntervention,
              //   }

              this.realm.write(() => {
                const data = this.realm.create('Interventions', Intervention, true)
                this.updateChildIntervention(Intervention, accountId);
              })
              // }


            }
            // else{

            //   if (!!currentInterventions.synchronizationDate && (currentInterventions.synchronizationDate !==Intervention.synchronizationDate)) {

            //     // if (Intervention.editDate && !Intervention.addDate) {
            //     //   Intervention.addDate = moment(Intervention.editDate).format('X')
            //     // }

            //     // if (!Intervention.addDate) {
            //     //   Intervention.addDate = moment(Intervention.planningDateStart, 'X').format('YYYY-MM-DD');
            //     // }
            //     // const combineIntervention = {
            //     //   ...Intervention,
            //     //   ...currentInterventions,
            //     // }
            //     if(Intervention.fkUserServerlId == undefined || Intervention.fkUserServerlId == 0 && Intervention.fkUserServerlId != "0" || Intervention.fkUserServerlId==null){
            //       Intervention.accountId = parseInt(companyID); 
            //     }else{
            //       Intervention.accountId = parseInt(accountId, 10)
            //     }
            //     this.realm.write(() => {
            //       this.updateChildIntervention(Intervention, accountId);
            //       const data = this.realm.create('Interventions', Intervention, true);
            //       console.log('data =>'+ data);
            //       resolve(data,true)
            //     })
            //   }
            // } 
            Setting.updateLastSync(`${lastSyncTime}`);
            InterventionMobx.setCountDataNew(interventions.length)
            resolve(true)
          } catch (e) {
            console.log('ErrorSyncInterventionFromServer : ' + e)
            reject({ success: false, message: e })
          }
        })
      })
    )
  }

  toObject(arr) {
    var rv = {};
    index = 0;
    for (var i = 0; i < arr.length; ++i) {
      if (arr[i] && !isNaN(arr[i])) {
        rv[index] = arr[i];
        index++;
      }
    }
    return rv;
  }

  getSyncFromLocal(accountId) {
    return this.realm
      .objects('Interventions')
      .filtered(`accountId = ${accountId} AND isToSync = 1`)
      .map(item => {
        keys = Object.keys(item);
        objSync = {};
        for (var i = 0; i < keys.length; i++) {
          if (item[keys[i]] || item[keys[i]] === 0) {
            console.log('keys[i]=>1 ' + keys[i]);
            if (mapServerField[keys[i]] || mapServerField[keys[i]] === 0) {
              if (keys[i] == 'planningDateStart' || keys[i] == 'planningDateEnd' || keys[i] == 'addDate' ||
                keys[i] == 'doneDateStart' || keys[i] == 'doneDateEnd' || keys[i] == 'editDate') {
                objSync[mapServerField[keys[i]]] = moment(item[keys[i]], 'YYYY-MM-DD HH:mm:ss').format('X');
              } else {
                objSync[mapServerField[keys[i]]] = item[keys[i]];
              }
            }
          }
        }
        if (objSync['intId'] && objSync['intIdServer']) {
          objSync['intCountMedia'] = SVMediaLink.getCountMediaOfIntervention(accountId, objSync['intId'], objSync['intIdServer'])
        } else {
          if (objSync['intId']) {
            objSync['intCountMedia'] = SVMediaLink.getCountMediaOfIntervention(accountId, objSync['intId'], -1)
          } else if (objSync['intIdServer']) {
            objSync['intCountMedia'] = SVMediaLink.getCountMediaOfIntervention(accountId, -1, objSync['intIdServer'])
          } else {
            objSync['intCountMedia'] = 0
          }
        }

        // if (!objSync['intFkUserId'] || objSync['intFkUserId'] == 0 ) {
        //   return null;
        // }
        return objSync;
      }
      )
  }

  syncFromLocal(Intervention, accountId) {
    if (!Intervention || Intervention.length === 0) return Promise.resolve({ message: 'No data' })
    return Promise.all(
      Intervention.map(
        ({ appli_id: appliId, server_id: serverId, code_id: code, ERROR: error }) => {
          if (error) {
            return
            throw new Error(error)
          }
          this.realm.write(() => {
            const data = {
              isToSync: 0,
              id: `${appliId}`,
              serverId: parseInt(serverId, 10),
              synchronizationDate: new Date(),
              accountId: parseInt(accountId, 10),
            }
            if (code) data.code = parseInt(code, 10)
            return this.realm.create('Interventions', data, true)
          })
        })
    )
  }

  removeNeedSync(Intervention, accountId) {
    if (!Intervention || Intervention.length === 0) return Promise.resolve({ message: 'RemoveSyncedIntervention - No data' })
    return Promise.all(
      Intervention.map(
        ({ id, serverId, code, isToSync }) => {
          try {
            // if (error) {
            //   return
            //   throw new Error(error)
            // }
            this.realm.write(() => {
              const data = {
                id,
                accountId: parseInt(accountId, 10),
                isToSync,
                synchronizationDate: new Date(),
              }
              if (code) data.code = parseInt(code, 10)
              if (serverId) data.serverId = parseInt(serverId, 10)
              const datareturn = this.realm.create('Interventions', data, true)
              console.log('datareturn' + JSON.stringify(datareturn))
              return datareturn
            })
          } catch (e) {
            console.log('ErrorRemoveSyncedIntervention : ' + e)
          }
        })
    )
  }
}

export default new InterventionServices()
