import { callApi, fetchApi } from './api'

export const onLogin = user =>
  new Promise((resolve, reject) => {
    fetchApi(
      `${callApi(user.account)}/get-login.php?user_name=${user.user_name}&password=${user.password}`
    )
      .then(res => resolve(res.json()))
      .catch(reject)
  })

export default {
  onLogin,
}
