const mongoose = require("mongoose")

const Schema = mongoose.Schema

const authorSchema = new Schema(
  {
    author: String,
    recipes: [Object]
  },
  { versionKey: false }
)
module.exports = mongoose.model("Authors", authorSchema)
