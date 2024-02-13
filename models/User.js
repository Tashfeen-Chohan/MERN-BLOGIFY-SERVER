const mongoose = require("mongoose");
const Joi = require("joi")
const passwordComplexity = require("joi-password-complexity")

const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, lowercase: true, require: true },
    email: { type: String, unique: true, lowercase: true, require: true },
    password: { type: String, require: true },
    profile: {type: String, default: "https://firebasestorage.googleapis.com/v0/b/mern-blogify.appspot.com/o/UserProfiles%2Fcowboy_6543190.pngc8eb353c-10f8-4987-8754-0c77a28d5035?alt=media&token=ca8bd27d-3ca8-4a81-98fc-1d782b0c9711"},
    roles: { type: [String], default: ["User"] },
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
    username: Joi.string().min(3).required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com'] } }),
    password: passwordComplexity(complexityOptions),
    profile: Joi.string(),
    roles: Joi.array().items(Joi.string().valid("User", "Publisher", "Admin"))
  })
  return schema.validate(user)
}

const validatePassword = (user) => {
  const schema = Joi.object({
    newPassword: passwordComplexity(complexityOptions),
  })
  return schema.validate(user)
}


module.exports = {
  User,
  validateUser,
  validatePassword
}
