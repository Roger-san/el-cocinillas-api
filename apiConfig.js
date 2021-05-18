const express = require("express")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")

const URLDB =
  "mongodb+srv://administrador:administrador@cluster0.ocexd.mongodb.net/DDBB?retryWrites=true&w=majority"

const appInit = () => {
  const api = express()
  api.set("port", process.env.PORT || 3001)
  api.use(bodyParser.json({ limit: "1mb", extended: true }))
  api.use(bodyParser.urlencoded({ limit: "2mb", extended: true }))
  api.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    )
    next()
    api.options("*", (req, res) => {
      // allowed XHR methods
      res.header("Access-Control-Allow-Methods", "GET, PATCH, PUT, POST, DELETE, OPTIONS")
      res.send()
    })
  })
  //mongoose config
  const opts = { useNewUrlParser: true, useUnifiedTopology: true }
  mongoose.connect(URLDB, opts, (err, res) => {
    if (err) console.error(err, opts, "fallo en la base de datos")
    else console.log("base de datos conectada")
  })
  return api
}
module.exports = { appInit: appInit }
