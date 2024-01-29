const { User, validateUser } = require("../models/User");
const { Post } = require("../models/Post");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

// GET USERS
const getAllUsers = asyncHandler(async (req, res) => {
  const sortBy = req.query.sortBy || "";
  const searchBy = req.query.searchBy || "";
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;

  let sortQuery = { updatedAt: -1 };

  // SEARCH FUNCTIONALITY BY NAME [CASE INSENSITIVE]
  const searchQuery = { username: { $regex: searchBy, $options: "i" } };

  // SORTING
  if (sortBy) {
    if (sortBy === "name") {
      sortQuery = { username: 1 };
    } else if (sortBy === "name desc") {
      sortQuery = { username: -1 };
    } else if (sortBy === "date") {
      sortQuery = { updatedAt: 1 };
    } else if (sortBy === "date desc") {
      sortQuery = { updatedAt: -1 };
    }
  }

  // PAGINATION
  const totalUsers = await User.countDocuments(searchQuery);
  const totalPages = Math.ceil(totalUsers / limit);
  const skip = (page - 1) * limit;
  const nextPage = page < totalPages ? page + 1 : null;
  const prevPage = page > 1 ? page - 1 : null;

  const users = await User
    .find(searchQuery)
    .select("-password")
    .sort(sortQuery)
    .skip(skip)
    .limit(limit);

  // if (!users?.length)
  //   return res.status(400).send({ message: "No user found!" });

  // CAPITALIZING USERNAME
  const capitalized = users.map((user) => {
    const words = user.username.split(" ");
    const capWords = words.map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    });
    return {
      ...user.toObject(),
      username: capWords.join(" "),
    };
  });

  res.status(200).send({
    capitalized,
    totalUsers,
    totalPages,
    nextPage,
    prevPage,
    page,
    limit,
  });
});

// GET SINGLE USER
const getSingleUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).select("-password");
  if (!user) return res.status(400).send({ message: "No user found!" });

  // CAPITALIZING USERNAME
  const words = user.username.split(" ");
  const capWords = words.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
  const capitalized = {
    ...user.toObject(),
    username: capWords.join(" "),
  };

  res.status(200).send(capitalized);
});

// POST USER
const createUser = asyncHandler(async (req, res) => {
  const { profile, username, email, password, roles } = req.body;

  const { error } = validateUser(req.body);
  if (error) return res.status(400).send({ message: error.details[0].message });

  let user = await User.findOne({ username });
  if (user) return res.status(400).send({ message: "Username already taken!" });

  user = await User.findOne({ email });
  if (user)
    return res
      .status(400)
      .send({ message: "User with that email already exists!" });

  const hashedPassword = await bcrypt.hash(password, 10);
  user = new User({ ...req.body, password: hashedPassword });
  await user.save();
  res.status(200).send({ message: "User created successfully!" });
});

// UPDATE USER
const updateUser = asyncHandler(async (req, res) => {
  const { username, email } = req.body;
  const { id } = req.params;
  // const authenticatedUser = req.user.id;

  // Check if the authenticated user is the not owner or not an admin
  // if (authenticatedUser !== id && req.user.roles.indexOf("Admin") === -1)
  //   return res.status(401).send({
  //     message:
  //       "Unauthorized: You can only update your own profile or be an Admin!",
  //   });

  const { error } = validateUser(req.body);
  if (error) return res.status(400).send({ message: error.details[0].message });

  let user = await User.findOne({ username, _id: { $ne: id } });
  if (user)
    return res
      .status(400)
      .send({ message: "Can't update. Username already exists!" });

  user = await User.findOne({ email, _id: { $ne: id } });
  if (user)
    return res
      .status(400)
      .send({ message: "Can't update. Email already exists!" });

  // const verifyUser = await User.findOne({ username: req.user.username });
  // if (!verifyUser)
  //   return res
  //     .status(401)
  //     .send({ message: "Forbidden: You can update only your profile!" });

  user = await User.findByIdAndUpdate(id, req.body, { new: true });
  if (!user) return res.status(400).send({ message: "User not found!" });
  res.status(200).send({ message: "Account updated successfully!" });
});

// DELETE USER
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const postCount = await Post.countDocuments({ author: id });
  if (postCount > 0)
    return res
      .status(400)
      .send({ message: "Can't delete User associated with Post" });

  const user = await User.findByIdAndDelete(id);
  if (!user) return res.status(400).send({ message: "No user found!" });
  res.status(200).send({ message: "User deleted successfully!" });
});

module.exports = {
  getAllUsers,
  createUser,
  getSingleUser,
  updateUser,
  deleteUser,
};
