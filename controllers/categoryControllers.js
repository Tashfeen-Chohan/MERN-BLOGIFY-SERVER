const { Category, validateCategory } = require("../models/Category");
const { Post } = require("../models/Post");
const asyncHandler = require("express-async-handler");

// GET ALL CATEGORIES
const getAllCategories = asyncHandler(async (req, res) => {
  const sortBy = req.query.sortBy || "";
  const searchBy = req.query.searchBy || "";
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;

  let sortQuery = { updatedAt: -1 };

  // SEARCH FUNCTIONALITY BY NAME [CASE INSENSITIVE]
  const searchQuery = { name: { $regex: searchBy, $options: "i" } };

  // SORTING
  if (sortBy) {
    if (sortBy === "name") {
      sortQuery = { name: 1 };
    } else if (sortBy === "name desc") {
      sortQuery = { name: -1 };
    } else if (sortBy === "date") {
      sortQuery = { updatedAt: 1 };
    } else if (sortBy === "date desc") {
      sortQuery = { updatedAt: -1 };
    }
  }

  // PAGINATION
  const totalCategories = await Category.countDocuments(searchQuery);
  const totalPages = Math.ceil(totalCategories / limit);
  const skip = (page - 1) * limit;
  const nextPage = page < totalPages ? page + 1 : null;
  const prevPage = page > 1 ? page - 1 : null;

  const categories = await Category.find(searchQuery)
    .sort(sortQuery)
    .skip(skip)
    .limit(limit);

  // if (!categories?.length) {
  //   return res.status(400).send({ message: "No category found!" });
  // }

  // Capitalize  each category name
  const capitalized = categories.map((category) => {
    const words = category.name.split(" ");

    const capWords = words.map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    });

    return {
      ...category.toObject(),
      name: capWords.join(" "),
    };
  });

  res.status(200).send({
    capitalized,
    totalCategories,
    totalPages,
    nextPage,
    prevPage,
    page,
    limit,
  });
});

// GET SINGLE CATEGORY
const getSingleCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category)
    return res.status(400).send({ message: "Category not found!" });

  // CAPITALIZED NAME PROPERTY
  const words = category.name.split(" ");
  const capWords = words.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
  const capitalized = {
    ...category.toObject(),
    name: capWords.join(" "),
  };

  res.status(200).send(capitalized);
});

// POST [ NEW CATEGORY ]
const createCategory = asyncHandler(async (req, res) => {
  // JOI VALIDATION CHECK
  const { error, value } = validateCategory(req.body);
  if (error) return res.status(400).send({ message: error.details[0].message });

  req.body = value;
  const { name } = req.body;

  // DUPLICATION CHECK
  let category = await Category.findOne({ name });
  if (category)
    return res.status(400).send({ message: "Category already exists!" });

  category = new Category({ name });
  await category.save();
  res.status(200).send({ message: "Category created succssfully!" });
});

// DELETE CATEGORY
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const postCount = await Post.countDocuments({ categories: id });
  if (postCount > 0)
    return res
      .status(400)
      .send({ message: "Can't delete Category with associated Posts" });

  const category = await Category.findByIdAndDelete(id);
  if (!category) return res.status(400).send({ message: "No category found!" });
  res.status(200).send({ message: "Category deleted successfully!" });
});

// UPDATE CATEGORY
const updateCategory = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const { error, value } = validateCategory(req.body);
  if (error) return res.status(400).send({ message: error.details[0].message });

  req.body = value;
  const { name } = req.body;

  let category = await Category.findOne({ name, _id: { $ne: id } });
  if (category)
    return res.status(400).send({ message: "Category already exists!" });

  category = await Category.findByIdAndUpdate(id, req.body, { new: true });
  if (!category)
    return res.status(400).send({ message: "Category not found!" });
  res.status(200).send({ message: "Category updated successfully!" });
});

module.exports = {
  getAllCategories,
  getSingleCategory,
  createCategory,
  deleteCategory,
  updateCategory,
};
