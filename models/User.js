const mongoose = require("mongoose");
const Joi = require("joi")
const passwordComplexity = require("joi-password-complexity")

const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, require: true },
    slug: { type: String, unique: true, require: true },
    email: { type: String, unique: true, lowercase: true, require: true },
    password: { type: String, require: true },
    profile: {type: String, default: "https://firebasestorage.googleapis.com/v0/b/mern-blogify.appspot.com/o/UserProfiles%2Fcowboy.png?alt=media&token=75c80891-40de-464b-a2da-0bb0af3fa08a"},
    roles: { type: [String], default: ["User"] },
    noOfPosts: {type: Number, default: 0}
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema)

const complexityOptions = {
  min: 5,
  max: 25,
  lowerCase: 1,
  upperCase: 1,
  numeric: 1
}

const validateUser = (user) => {
  const schema = Joi.object({
    username: Joi.string().trim().min(3).required(),
    email: Joi.string().trim().email({ minDomainSegments: 2, tlds: { allow: ['com'] } }),
    password: passwordComplexity(complexityOptions),
    profile: Joi.string(),
    roles: Joi.array().items(Joi.string().valid("User", "Publisher", "Admin"))
  })
  return schema.validate(user)
}

const validatePassword = (user) => {
  const schema = Joi.object({
    newPassword: passwordComplexity(complexityOptions),
    confirmPassword: Joi.string()
  })
  return schema.validate(user)
}


module.exports = {
  User,
  validateUser,
  validatePassword
}
