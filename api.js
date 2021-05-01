const { appInit } = require("./apiConfig.js")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const log = require("./log/log.js")
const Author = require("./models/Author.js")
const Recipe = require("./models/Recipe.js")
const Login = require("./models/Login.js")

const api = appInit()

const SEED = "MY_SEED_auth_rules!"
// const PORT = 3000
// MIDDLEWARE
api.all("*", function (req, res, next) {
  log.log(req, "api")
  next()
})

// GET
// POST
api.post("/api/users/authorRecipes", (req, res) => {
  Author.findOne({ author: req.body.author }, (err, data) => {
    if (err) return res.status(500).send({ message: "something went wrong" })
    if (data) return res.status(200).send({ message: "success", data: [...data.recipes] })
  })
})
api.post("/api/recipes", (req, res) => {
  Recipe.find({}, null, { skip: req.body.skip, limit: 12 }, (err, data) => {
    if (err) return res.status(500).send({ message: "something went wrong" })
    if (data) return res.status(200).send({ message: "success", data: data })
  })
})
api.post("/api/users/register", (req, res) => {
  Login.findOne({ author: req.body.author, email: req.body.email }, (err, user) => {
    if (err) return res.status(500).send({ message: "login fail" })
    if (user) return res.status(403).send({ message: "The email is already in use" })
    if (!user) {
      const { author, email, password } = req.body
      bcrypt.hash(password, 12).then((hashedPassword) => {
        const newUser = { author: author, email: email, password: hashedPassword }
        Login.create(newUser, (err, data) => {
          if (err) return res.status(500).send(err)
          if (data) {
            const token = jwt.sign({ usuario: data }, SEED, {
              expiresIn: "30d"
            })
            Author.create({ author: data.author }, (err, data) => {
              if (err) return res.status(500).send({ message: "user not saved" })
              if (data) {
                return res
                  .status(201)
                  .send({ message: "user created", token: token, authorData: data })
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
    if (err) return res.status(500).send({ message: "Fallo de login" })
    if (!user)
      return res.status(403).send({ message: "Usuario u o contraseña incorrecta" })
    if (user) {
      bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (err) return res.status(500).send({ message: "Fallo de login" })
        if (result) {
          const token = jwt.sign({ usuario: user }, SEED, {
            expiresIn: "30d"
          })
          Author.findOne({ authorName: result.author }, (err, user) => {
            if (err) res.status(500).send({ message: "user not found" })
            if (user)
              res
                .status(200)
                .send({ message: "user data found", authorData: user, token: token })
          })
        } else res.status(403).send({ message: "Usuario y o contraseña incorrectos" })
      })
    }
  })
})
api.post("/api/users/token", (req, res) => {
  if (!req.body.token) return console.log("atrasss")
  jwt.verify(req.body.token, SEED, (err, data) => {
    if (err) res.status(500).send({ message: "token doesn't match" })
    else {
      Author.findOne({ authorName: data.usuario.authorName }, (err, user) => {
        if (err) res.status(500).send({ message: "user not found" })
        if (data) res.status(200).send({ message: "user data found", authorData: user })
      })
    }
  })
})
api.post("/api/users/new-recipe", (req, res) => {
  const {
    author,
    recipeName,
    description,
    ingredients,
    steps,
    frontImage
  } = req.body.newRecipe
  //en un futuro quitar esto ya que la comprobacion sera desde el cliente
  if (author && recipeName && steps) {
    Recipe.create(req.body.newRecipe, (err, savedRecipe) => {
      if (err)
        res.status(400).send({
          success: false,
          data: err
        })
      else {
        Author.findByIdAndUpdate(
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
    // const autorRecipe = {
    //   id: "asd", // ay que cambiar el como opera la id
    //   name: name,
    //   descripcion: descripcion || undefined,
    //   frontImage: frontImage || undefined
    // }

    // Author.findOneAndUpdate(
    //   { author: req.body.author },
    //   { $push: { recipes: autorRecipe } },
    //   { new: true, upsert: true, useFindAndModify: false },
    //   (err, data) => {
    //     if (err) console.log(err)
    //     // if (data) console.log(`este es el bd del autor:${data}`)
    //   }
    // )
  } else res.status(400).send("we need more data")
})

api.listen(api.get("port"), () =>
  console.log(`Api is running in localhost:${api.get("port")}`)
)
