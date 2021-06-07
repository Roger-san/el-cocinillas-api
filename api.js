const { appInit } = require("./apiConfig.js")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const Authors = require("./models/Authors.js")
const Recipes = require("./models/Recipes.js")
const Login = require("./models/Login.js")
const Images = require("./models/Images.js")

const api = appInit()

const SEED = "MY_SEED_auth_rules!"

// GET
api.get("/api/recipe/image/:name", (req, res) => {
  Images.findOne({ name: req.params.name }, (err, data) => {
    if (err) return res.status(500).send({ success: false, message: err })
    if (data) return res.status(200).send({ success: true, data: data })
  })
})
api.get("/api/recipes/:skip", (req, res) => {
  Recipes.find({}, (err, data) => {
    if (err)
      return res
        .status(500)
        .send({ message: "something went wrong:" + err, success: false })
    if (data) {
      const recipesList = data.map((recipe) => recipe.recipeName)
      const totalRecipes = data.length
      const recipes = [...data].reverse().splice(Number(req.params.skip), 12)
      return res.status(200).send({
        success: true,
        totalRecipes: totalRecipes,
        recipes: recipes,
        recipesList: recipesList
      })
    }
  })
})
api.get("/api/login/token/:data", (req, res) => {
  if (!req.params.data)
    return res.status(401).send({ success: false, message: "no token" })
  jwt.verify(req.params.data, SEED, (err, data) => {
    if (err)
      return res
        .status(500)
        .send({ success: false, message: "token doesn't match:" + err })
    else {
      Authors.findOne({ author: data.usuario.author }, (err, user) => {
        if (err)
          return res.status(500).send({ success: true, message: "user not found:" + err })
        if (data)
          return res
            .status(200)
            .send({ succes: true, message: "user data found", authorData: user })
      })
    }
  })
})
api.get("/api/user/authorRecipes/:author", (req, res) => {
  Authors.findOne({ author: req.params.author }, (err, data) => {
    if (err)
      return res
        .status(500)
        .send({ message: "something went wrong:" + err, success: false })
    if (data) return res.status(200).send({ success: true, data: [...data.recipes] })
  })
})
api.get("/api/recipe/:recipeName", (req, res) => {
  const regEx = new RegExp(`(${req.params.recipeName})`, "gi")
  Recipes.find({ recipeName: regEx }, (err, recipe) => {
    if (err)
      return res.status(500).send({ message: "something went wrong", success: false })
    if (recipe === null || recipe.length !== 1)
      return res.status(200).send({ success: false })
    if (recipe) return res.status(200).send({ success: true, recipe: recipe[0] })
  })
})
// POST
api.post("/api/user/register", (req, res) => {
  Login.findOne({ author: req.body.author, email: req.body.email }, (err, user) => {
    if (err)
      return res
        .status(500)
        .send({ message: "System failure: database login fail:" + err, success: false })
    if (user)
      return res
        .status(403)
        .send({ message: "The email is already in use", success: false })
    if (!user) {
      const { author, email, password } = req.body
      bcrypt.hash(password, 12).then((hashedPassword) => {
        const newUser = { author: author, email: email, password: hashedPassword }
        Login.create(newUser, (err, data) => {
          if (err)
            return res.status(500).send({
              message: "System failure: database user creation fail:" + err,
              success: false
            })
          if (data) {
            const token = jwt.sign({ usuario: data }, SEED, {
              expiresIn: "30d"
            })
            Authors.create({ author: data.author }, (err, data) => {
              if (err)
                return res.status(500).send({
                  message: "System failure: user not saved:" + err,
                  success: false
                })
              if (data) {
                return res.status(201).send({
                  token: token,
                  authorData: data,
                  success: true
                })
              }
            })
          }
        })
      })
    }
  })
})
api.post("/api/login/login", (req, res) => {
  Login.findOne({ email: req.body.email }, (err, user) => {
    if (err)
      return res.status(500).send({ message: "System failure:" + err, success: false })
    if (!user)
      return res
        .status(403)
        .send({ message: "Email or password incorrect", success: false })
    if (user) {
      bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (err)
          return res
            .status(500)
            .send({ message: "System failure:" + err, success: false })
        if (result) {
          const token = jwt.sign({ usuario: user }, SEED, {
            expiresIn: "30d"
          })
          Authors.findOne({ author: user.author }, (err, user) => {
            if (err)
              return res
                .status(500)
                .send({ message: "Email or password incorrect:" + err, success: false })
            if (user)
              return res.status(200).send({
                authorData: user,
                token: token,
                success: true
              })
          })
        } else
          return res
            .status(403)
            .send({ message: "Email or password incorrect", success: false })
      })
    }
  })
})
api.post("/api/create/new-recipe", (req, res) => {
  Recipes.create(req.body.newRecipe, (err, savedRecipe) => {
    if (err)
      return res.status(400).send({
        success: false,
        message: err
      })
    else {
      Authors.findByIdAndUpdate(
        req.body.userData._id,
        req.body.userData,
        { new: true, useFindAndModify: false },
        (err, authorUpdated) => {
          if (err)
            return res.status(400).send({
              success: false,
              message: err
            })
          if (authorUpdated)
            return res.status(201).send({
              success: true,
              data: authorUpdated
            })
        }
      )
    }
  })
})
api.post("/api/create/new-picture", (req, res) => {
  Images.create({ data: req.body.data, name: req.body.name }, (err, data) => {
    if (err)
      return res.status(500).send({
        success: false,
        message: "somecing wrent wrong saving the picture:" + err
      })
    if (data)
      return res.status(201).send({ success: true, message: "image saved successfully" })
  })
})
api.listen(api.get("port"), () =>
  console.log(`Api is running in localhost:${api.get("port")}`)
)
