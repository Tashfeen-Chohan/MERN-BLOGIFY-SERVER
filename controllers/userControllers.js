const { User, validateUser, validatePassword } = require("../models/User");
const { Post } = require("../models/Post");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

// GET USERS
const getAllUsers = asyncHandler(async (req, res) => {
  const sortBy = req.query.sortBy || "";
  const searchBy = req.query.searchBy || "";
  const filterBy = req.query.filterBy || "";
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;

  let sortQuery = { noOfPosts: -1 };

  // SEARCH FUNCTIONALITY BY NAME [CASE INSENSITIVE]
  let searchQuery = { username: { $regex: searchBy, $options: "i" } };

  // ROLE FILTERATION
  if (filterBy) {
    searchQuery = {
      username: { $regex: searchBy, $options: "i" },
      roles: filterBy,
    };
  }

  // SORTING
  if (sortBy) {
    if (sortBy === "date") {
      sortQuery = { updatedAt: 1 };
    } else if (sortBy === "date desc") {
      sortQuery = { updatedAt: -1 };
    } else if (sortBy === "posts"){
      sortQuery = { noOfPosts: -1 }
    }
  }

  // PAGINATION
  const totalUsers = await User.countDocuments(searchQuery);
  const totalPages = Math.ceil(totalUsers / limit);
  const skip = (page - 1) * limit;
  const nextPage = page < totalPages ? page + 1 : null;
  const prevPage = page > 1 ? page - 1 : null;

  const users = await User.find(searchQuery)
    .select("-password")
    .sort(sortQuery)
    .skip(skip)
    .limit(limit);

  res.status(200).send({
    users,
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

  const totalPosts = await Post.countDocuments({ author: req.params.id });

  res.status(200).send({
    user,
    totalPosts,
  });
});

// POST USER
const createUser = asyncHandler(async (req, res) => {

  const { error, value } = validateUser(req.body);
  if (error) return res.status(400).send({ message: error.details[0].message });

  const {username, email, password} = value
  const lowercaseUsername  = username.toLowerCase()
  const lowercaseEmail  = email.toLowerCase()

  let user = await User.findOne({ username: lowercaseUsername });
  if (user) return res.status(400).send({ message: "Username already taken!" });

  user = await User.findOne({ email: lowercaseEmail });
  if (user)
    return res
      .status(400)
      .send({ message: "User with that email already exists!" });

  const hashedPassword = await bcrypt.hash(password, 10);
  user = new User({ ...value, password: hashedPassword });
  await user.save();
  res.status(200).send({ message: "User created successfully!" });
});

// UPDATE USER
const updateUser = asyncHandler(async (req, res) => {
  const { username, email } = req.body;
  const { id } = req.params;
  const authenticatedUser = req.user.id;

  // Check if the authenticated user is  owner or  an admin
  if (authenticatedUser !== id && req.user.roles.indexOf("Admin") === -1)
    return res.status(401).send({
      message:
        "Unauthorized: You can only update your own profile or be an Admin!",
    });

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

// CHANGE PASSWORD
const changePassword = asyncHandler(async (req, res) => {
  const { id, currentPassword, newPassword, confirmPassword } = req.body;

  const { error } = validatePassword({ newPassword, confirmPassword });
  if (error) return res.status(400).send({ message: error.details[0].message });

  const user = await User.findById(id);
  if (!user) return res.status(400).send({ message: "User not found!" });

  // CHECK IF CURRENT PASSWORD IS VALID
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid)
    return res.status(400).send({ message: "Invalid current password!" });

  // CHECK IF NEW && CONFIRM PASSWORD MATCHES
  if (newPassword !== confirmPassword)
    return res
      .status(400)
      .send({ message: "New and Confirm password didn't matched!" });

  // HASH NEW PASSWORD
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  // UPDATE USER'S PASSWORD
  user.password = hashedNewPassword;
  await user.save();

  return res.status(200).send({ message: "Password updated successfully! Now login again with new Password!" });
});

// TOTAL USERS [NUMBERS]
const totalUsers = asyncHandler(async (req, res) => {

  const total = await User.countDocuments()

  const now = new Date();
  const oneMonthAgo = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    now.getDate()
  );

  const lastMonth = await User.countDocuments({
    createdAt: { $gte: oneMonthAgo },
  });

  // Calculate one week ago
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); 

  const lastWeek = await User.countDocuments({
    createdAt: { $gte: oneWeekAgo },
  });

  res.status(200).send({
    total,
    lastWeek,
    lastMonth,
  })

})

module.exports = {
  getAllUsers,
  createUser,
  getSingleUser,
  updateUser,
  deleteUser,
  changePassword,
  totalUsers
};
