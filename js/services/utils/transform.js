export function parseDateFromUnixTime(unixTime) {
  unixTime = Number.parseInt(unixTime, 10)
  if (!unixTime) return undefined
  if (unixTime instanceof Date) return unixTime
  const epoch = Number.parseInt(unixTime, 10)
  if (epoch < Math.pow(10, 9)) throw new Error(`Value ${epoch} (${unixTime}) is an invalid Unix timestamp.`)
  return new Date(epoch * 1000)
}
