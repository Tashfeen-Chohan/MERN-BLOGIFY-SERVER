const {User, validateUser} = require("../models/User")
const asyncHandler = require("express-async-handler")

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
  if (!users?.length) return res.status(400).send({message: "No user found!"})
  
  // CAPITALIZING USERNAME
  const capitalized = users.map((user) => {
    return {
      ...users.toObject(),
      username: users.name.charAt(0).toUpperCase() + users.name.slice(1)
    }
  })

  res.status(200).send(capitalized)
})

module.exports = {
  getAllUsers,
}