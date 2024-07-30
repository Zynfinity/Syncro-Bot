const formatDate = (date, format = 'dd-mm-yyyy') => {
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();

  if (day < 10) {
    day = '0' + day;
  }
  if (month < 10) {
    month = '0' + month;
  }

  const formattedDate = format
    .replace('dd', day)
    .replace('mm', month)
    .replace('yyyy', year);

  return formattedDate;
}
const toTimer = async (seconds) => {
  function pad(s) {
    return (s < 10 ? '0' : '') + s
  }
  var hours = Math.floor(seconds / (60 * 60))
  var minutes = Math.floor((seconds % (60 * 60)) / 60)
  var seconds = Math.floor(seconds % 60)

  //return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds)
  return `${pad(hours)} Jam - ${pad(minutes)} Menit - ${pad(seconds)} Detik`
}
module.exports = { formatDate, toTimer }
