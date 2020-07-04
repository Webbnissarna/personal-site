exports.formatDateNumber = function (num) {
  const date = new Date(Number.parseInt(num))
  const yyyy = date.getUTCFullYear().toString()
  const mm = (date.getUTCMonth() + 1).toString().padStart(2, '0')
  const dd = date.getUTCDate().toString().padStart(2, '0')
  const H = date.getUTCHours().toString().padStart(2, '0')
  const M = date.getUTCMinutes().toString().padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${H}:${M} (UTC)`
}

exports.getStaticContentUrl = function (key) {
  return `${window.location.protocol}//api.${window.location.hostname}/_files/main/${key}`
}

exports.mod = (x, n) => ((x % n + n) % n)
