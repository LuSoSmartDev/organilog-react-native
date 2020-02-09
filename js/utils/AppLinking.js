import { Linking } from 'react-native'

function openApp(url) {
  Linking.canOpenURL(url).then(supported => {
    if (supported) {
      Linking.openURL(url);
    } else {
      console.log('Don\'t know how to open URI: ' + url);
    }
  });
}

export function openGoogleMap(lat, lng) {
  if (lat === 0 || lng === 0 || lat === '' || lng === '') {
    return
  }
  url = `http://maps.apple.com/?daddr=${lat},${lng}`
  openApp(url)
}

export function sendMail(emailTo, subject, body, isAllowEmptyMail = false) {
  // console.log('SendMailTo : ' + emailTo)
  if (!emailTo && !isAllowEmptyMail) return
  if (!subject) {
    subject = ""
  }
  if (!body) {
    body = ""
  }
  url = `mailto:${emailTo}?subject=${subject}&body=${body}`
  openApp(url)
}

export default { openGoogleMap, sendMail }