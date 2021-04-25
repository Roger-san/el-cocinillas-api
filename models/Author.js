const mongoose = require("mongoose")

const Schema = mongoose.Schema

//los schema se usan para introducir la info en la base de datos

const recipeSchema = new Schema(
  {
    recipeId: String,
    //esta id es la de el recipe original
    recipeName: String,
    description: String,
    frontImage: String
  },
  { versionKey: false, _id: false }
)

const authorSchema = new Schema(
  {
    author: String,
    recipes: [Object],
    config: [Object],
    data: [Object]
  },
  { versionKey: false }
)
module.exports = mongoose.model("Author", authorSchema)
