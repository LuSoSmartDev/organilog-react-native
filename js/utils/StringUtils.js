const isDataURLRegex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/

export function isUrl(str) {
  console.log('URLValidating : ' + str)
  return !!str.match(isDataURLRegex);
}

export default { isUrl }