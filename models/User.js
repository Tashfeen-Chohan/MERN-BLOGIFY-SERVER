const mongoose = require("mongoose");
const Joi = require("joi")
const passwordComplexity = require("joi-password-complexity")

const userSchema = new mongoose.Schema(
  {
    profile: { type: String },
    username: { type: String, unique: true, lowercase: true, require: true },
    email: { type: String, unique: true, lowercase: true, require: true },
    password: { type: String, require: true },
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
    profile: Joi.string(),
    username: Joi.string().min(3).required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com'] } }),
    password: passwordComplexity(complexityOptions),
    roles: Joi.array().items(Joi.string().valid("User", "Publisher", "Admin"))
  })
  return schema.validate(user)
}


module.exports = {
  User,
  validateUser
}
