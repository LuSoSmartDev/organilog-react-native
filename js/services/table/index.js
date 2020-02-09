import { properties as address } from './address'
import { properties as setting } from './setting'
import { properties as client } from './client'
import { properties as chemin } from './chemin'
import { properties as message } from './message'
import { properties as user } from './user'
import { properties as filiale } from './filiale'
import { properties as intervention } from './intervention'
import { properties as media } from './media'
import { properties as mediaLink } from './mediaLink'
import { properties as linkInterventionTask } from './linkInterventionTask'
import { properties as task } from './task'
import { properties as unite } from './unite'
import { properties as uniteItem } from './uniteItemValue'
import { properties as uniteLink } from './uniteLink'
import { properties as locationLog } from './location'
import { properties as tracking } from './tracking'
import { properties as categoryTracking } from './categoryTracking'
import { properties as products } from './products'
import { properties as linkInterventionProduct } from './LinkInterventionProduct'
const Realm = require('realm')

const AddressSchema = {
  name: 'Addresses',
  primaryKey: 'id',
  properties: address,
}

const ClientSchema = {
  name: 'Clients',
  primaryKey: 'id',
  properties: client,
}

const SettingSchema = {
  name: 'Settings',
  primaryKey: 'id',
  properties: setting,
}

const CheminSchema = {
  name: 'Chemins',
  primaryKey: 'id',
  properties: chemin,
}

const MessageSchema = {
  name: 'Messages',
  primaryKey: 'id',
  properties: message,
}

const UserSchema = {
  name: 'Users',
  primaryKey: 'id',
  properties: user,
}

const FilialeSchema = {
  name: 'Filiales',
  primaryKey: 'id',
  properties: filiale,
}

const InterventionSchema = {
  name: 'Interventions',
  primaryKey: 'id',
  properties: intervention,
}

const MediaSchema = {
  name: 'Medias',
  primaryKey: 'id',
  properties: media,
}

const MediaLinkSchema = {
  name: 'MediaLinks',
  primaryKey: 'id',
  properties: mediaLink,
}
const TaskSchema = {
  name: 'Task',
  primaryKey: 'id',
  properties: task,
}
const LinkInterventionTaskSchema = {
  name: 'LinkInterventionTask',
  primaryKey: 'id',
  properties: linkInterventionTask,
}
const UniteSchema = {
  name: 'Unite',
  primaryKey: 'id',
  properties: unite,
}
const UniteItemSchema = {
  name: 'UniteItem',
  primaryKey: 'id',
  properties: uniteItem,
}
const UniteLinksSchema = {
  name: 'UniteLinks',
  primaryKey: 'id',
  properties: uniteLink,
}
const LocationSchema = {
  name: 'Locations',
  primaryKey: 'lId',
  properties: locationLog
}
const TrackingSchema = {
  name: 'Trackings',
  primaryKey: 'tr_id',
  properties: tracking
}

const CategoryTrackingSchema = {
  name: 'CategoryTracking',
  primaryKey: 'id',
  properties: categoryTracking
}

const ProductSchema = {
  name: 'Products',
  primaryKey: 'id',
  properties: products
}

const LinkInterventionProductSchema = {
  name: 'LinkInterventionProduct',
  primaryKey: 'id',
  properties: linkInterventionProduct
}

export default new Realm({
  schemaVersion: 3,
  schema: [
    UserSchema,
    ClientSchema,
    CheminSchema,
    FilialeSchema,
    SettingSchema,
    AddressSchema,
    MessageSchema,
    InterventionSchema,
    MediaSchema,
    MediaLinkSchema,
    TaskSchema,
    LinkInterventionTaskSchema,
    UniteSchema,
    UniteItemSchema,
    UniteLinksSchema,
    LocationSchema,
    TrackingSchema,
    CategoryTrackingSchema,
    ProductSchema,
    LinkInterventionProductSchema
  ],
  migration: () => { },
})
