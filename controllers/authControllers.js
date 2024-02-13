const { User } = require("../models/User");
const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).send({ message: "All fields are required!" });

  const user = await User.findOne({ email });
  if (!user) return res.status(400).send({ message: "Invalid Credentials!" });

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid)
    return res.status(400).send({ message: "Invalid Credentials!" });

  const accessToken = jwt.sign(
    {
      UserInfo: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        roles: user.roles,
      },
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "7d" }
  );

  res.cookie("jwt", accessToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).send({ message: "Login Sucessfull!", accessToken });
});

const logout = asyncHandler(async (req, res) => {
  // const cookies = req.cookies.jwt;
  // if (!cookies) return res.sendStatus(204); // NO CONTENT

  // Clear the cookie by setting an empty value and an expired date
  res.cookie("jwt", '', { expires: new Date(0) });
  res.status(200).send({ message: "Logout Successfull!" });
});

module.exports = {
  login,
  logout,
};
