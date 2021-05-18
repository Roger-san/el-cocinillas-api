const mongoose = require("mongoose")

const Schema = mongoose.Schema

const imageSchema = new Schema(
  {
    data: String,
    name: String
  },
  { versionKey: false }
)
module.exports = mongoose.model("Images", imageSchema)
