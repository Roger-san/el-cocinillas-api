const { appInit } = require("./apiConfig.js")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const log = require("./log/log.js")
const Authors = require("./models/Authors.js")
const Recipes = require("./models/Recipes.js")
const Login = require("./models/Login.js")

const api = appInit()

const SEED = "MY_SEED_auth_rules!"

// MIDDLEWARE
api.all("*", function (req, res, next) {
  log.log(req, "api")
  next()
})

// GET
// POST
api.post("/api/users/authorRecipes", (req, res) => {
  Authors.findOne({ author: req.body.author }, (err, data) => {
    if (err) return res.status(500).send({ message: "something went wrong" })
    if (data) return res.status(200).send({ message: "success", data: [...data.recipes] })
  })
})
api.post("/api/recipes", (req, res) => {
  Recipes.find({}, (err, data) => {
    if (err) return res.status(500).send({ message: "something went wrong" })
    if (data)
      return res.status(200).send({
        message: "success",
        data: data.reverse().splice(req.body.skip, 12),
        pagesLength: data.length
      })
  })
})
api.post("/api/users/register", (req, res) => {
  Login.findOne({ author: req.body.author, email: req.body.email }, (err, user) => {
    if (err)
      return res
        .status(500)
        .send({ message: "System failure: database login fail", success: false })
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
            return res
              .status(500)
              .send({
                message: "System failure: database user creation fail",
                success: false
              })
          if (data) {
            const token = jwt.sign({ usuario: data }, SEED, {
              expiresIn: "30d"
            })
            Authors.create({ author: data.author }, (err, data) => {
              if (err)
                return res
                  .status(500)
                  .send({ message: "System failure: user not saved", success: false })
              if (data) {
                return res
                  .status(201)
                  .send({
                    message: "user created",
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
api.post("/api/users/login", (req, res) => {
  Login.findOne({ email: req.body.email }, (err, user) => {
    if (err) return res.status(500).send({ message: "System failure", success: false })
    if (!user)
      return res
        .status(403)
        .send({ message: "Email or password incorrect", success: false })
    if (user) {
      bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (err)
          return res.status(500).send({ message: "System failure", success: false })
        if (result) {
          const token = jwt.sign({ usuario: user }, SEED, {
            expiresIn: "30d"
          })
          Authors.findOne({ author: user.author }, (err, user) => {
            if (err)
              res
                .status(500)
                .send({ message: "Email or password incorrect", success: false })
            if (user)
              res.status(200).send({
                message: "user data found",
                authorData: user,
                token: token,
                success: true
              })
          })
        } else
          res.status(403).send({ message: "Email or password incorrect", success: false })
      })
    }
  })
})
api.post("/api/users/token", (req, res) => {
  if (!req.body.token) return console.log("atrasss")
  jwt.verify(req.body.token, SEED, (err, data) => {
    if (err) res.status(500).send({ message: "token doesn't match" })
    else {
      Authors.findOne({ author: data.usuario.author }, (err, user) => {
        if (err) res.status(500).send({ message: "user not found" })
        if (data) res.status(200).send({ message: "user data found", authorData: user })
      })
    }
  })
})
api.post("/api/users/new-recipe", (req, res) => {
  const { author, recipeName, steps } = req.body.newRecipe
  //en un futuro quitar esto ya que la comprobacion sera desde el cliente
  if (author && recipeName && steps) {
    Recipes.create(req.body.newRecipe, (err, savedRecipe) => {
      if (err)
        res.status(400).send({
          success: false,
          data: err
        })
      else {
        Authors.findByIdAndUpdate(
          req.body.userData._id,
          req.body.userData,
          { new: true, useFindAndModify: false },
          (err, authorUpdated) => {
            if (err)
              res.status(400).send({
                success: false,
                data: err
              })
            if (authorUpdated)
              res.status(201).send({
                success: true,
                data: authorUpdated
              })
          }
        )
      }
    })
  } else res.status(400).send({ success: false })
})

api.listen(api.get("port"), () =>
  console.log(`Api is running in localhost:${api.get("port")}`)
)
