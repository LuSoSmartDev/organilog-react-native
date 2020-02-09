export const API_SERVER_TO_MOBILE_VERSION = 11
export const API_MOBILE_TO_SERVER_VERSION = 10
export const API_SERVER_TO_MOBILE_PRODUCT_VERSION = 9
export const API_HISTORY_VERSION = 1
export const APP_VERSION = 'v2.2'
export const callApi = subDomain =>
  `http://${subDomain}.organilog.com/script/api`
export const SERVER_REGISTER_URL = 'http://fr.organilog.com/inscription/'

export const fetchApi = (url, newOptions) => {
  const optionsDefault = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  }

  const options = { ...optionsDefault, ...newOptions }
  return fetch(url, options)
}

export const api = subdomain => create({
  baseURL: `http://${subdomain}.organilog.com/script/api`,
})

export default { callApi, API_SERVER_TO_MOBILE_VERSION, API_MOBILE_TO_SERVER_VERSION, API_SERVER_TO_MOBILE_PRODUCT_VERSION, fetchApi, APP_VERSION }
