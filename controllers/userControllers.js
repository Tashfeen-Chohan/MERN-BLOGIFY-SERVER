const {User, validateUser} = require("../models/User")
const asyncHandler = require("express-async-handler")
const bcrypt = require('bcrypt');

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password")
  if (!users?.length) return res.status(400).send({message: "No user found!"})
  
  // CAPITALIZING USERNAME
  const capitalized = users.map((user) => {
    return {
      ...user.toObject(),
      username: user.username.charAt(0).toUpperCase() + user.username.slice(1)
    }
  })

  res.status(200).send(capitalized)
})

const createUser = asyncHandler(async (req, res) => {
  const {profile, username, email, password, roles} = req.body

  const { error } = validateUser(req.body)
  if (error) return res.status(400).send({message: error.details[0].message})

  let user = await User.findOne({username})
  if (user) return res.status(400).send({message: "Username already taken!"})

  user = await User.findOne({email})
  if (user) return res.status(400).send({message: "User with that email already exists!"})

  const hashedPassword = await bcrypt.hash(password, 10)
  user = new User({...req.body, password: hashedPassword})
  await user.save()
  res.status(200).send({message: "User created successfully!"})
})

module.exports = {
  getAllUsers,
  createUser,
}