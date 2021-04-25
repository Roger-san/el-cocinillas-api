const mongoose = require("mongoose")

const Schema = mongoose.Schema

const recipeSchema = new Schema(
  {
    author: String,
    recipeName: String,
    description: String,
    ingredients: [Object],
    steps: [Object],
    frontImage: String
  },
  { versionKey: false }
  // versionKey: false elimina la creacion de un parametro
  // adicional que es inecesario
)

module.exports = mongoose.model("Recipe", recipeSchema)
