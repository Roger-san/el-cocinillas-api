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
)

module.exports = mongoose.model("Recipes", recipeSchema)
