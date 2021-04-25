const fs = require("fs")
const LOG = "Required FOR logi@n"

const error = (request, from) => {
  console.log(`${request.url} not found`) //borrar en el futuro
  const data = `\n${from}|${new Date().toISOString()}|${request.method}|${request.headers.host}${request.url}`
  fs.appendFile("./log/error.log", data, (err) => {
    if (err) console.log("error.log not found") //borrar en el futuro
  })
}

const log = (request, from) => {
  const data = `\n${from}|${new Date().toISOString()}|${request.method}|${request.headers.host}${request.url}`
  fs.appendFile("./log/log.log", data, (err) => {
    if (err) console.log(`log file not found or error locating ${req.url}`)
  })
}

module.exports = {
  error: error,
  log: log,
  LOG: LOG,
}
