export function displayTime(val) {
  return (val < 10) ? '0' + val : val;
}

export function getTimestamp(hours) {
  if (hours) {
    arrTime = hours.split(':');
    if (arrTime.length == 2) {
      return parseInt(arrTime[0]) * 60 + parseInt(arrTime[1])
    }
  }
  return 0;
}

export function getTimeJob(secondTime) {
  try {
    hours = ~~(secondTime / 60);
    minutes = secondTime - hours * 60;
    
    return displayTime(hours) +':'+ displayTime(minutes)
  } catch (e) {
    // console.log('getLastTimeFinishJob_Error : ' + e)
  }
}

export default { displayTime, getTimestamp, getTimeJob }