const { default: slugify } = require("slugify");
const { Category, validateCategory } = require("../models/Category");
const { Post } = require("../models/Post");
const asyncHandler = require("express-async-handler");

// GET ALL CATEGORIES
const getAllCategories = asyncHandler(async (req, res) => {
  const sortBy = req.query.sortBy || "";
  const searchBy = req.query.searchBy || "";
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  let sortQuery = { noOfPosts: -1 };

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
    } else if (sortBy === "posts") {
      sortQuery = { noOfPosts: -1 };
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

  res.status(200).send({
    categories,
    totalCategories,
    totalPages,
    nextPage,
    prevPage,
    page,
    limit,
  });
});

// TOTAL CATEGORIES [NUMBERS]
const totalCategories = asyncHandler(async (req, res) => {
  const total = await Category.countDocuments();

  const now = new Date();
  const oneMonthAgo = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    now.getDate()
  );

  const lastMonth = await Category.countDocuments({
    createdAt: { $gte: oneMonthAgo },
  });

  // Calculate one week ago
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const lastWeek = await Category.countDocuments({
    createdAt: { $gte: oneWeekAgo },
  });

  res.status(200).send({
    total,
    lastWeek,
    lastMonth,
  });
});

// GET SINGLE CATEGORY
const getSingleCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category)
    return res.status(400).send({ message: "Category not found!" });

  res.status(200).send({ category });
});

// POST [ NEW CATEGORY ]
const createCategory = asyncHandler(async (req, res) => {
  // JOI VALIDATION CHECK
  const { error, value } = validateCategory(req.body);
  if (error) return res.status(400).send({ message: error.details[0].message });

  const { name } = value;
  const lowercaseName = name.toLowerCase();

  // DUPLICATION CHECK
  let category = await Category.findOne({ name: lowercaseName });
  if (category)
    return res.status(400).send({ message: "Category already exists!" });

  // SLUG GENERATION
  const slug = slugify(name, { lower: true });

  category = new Category({ name, slug });
  await category.save();
  res.status(200).send({ message: "Category created succssfully!" });
});

// UPDATE CATEGORY
const updateCategory = asyncHandler(async (req, res) => {
  const slug = req.params.slug;

  const { error, value } = validateCategory(req.body);
  if (error) return res.status(400).send({ message: error.details[0].message });

  req.body = value;
  const { name } = req.body;

  let category = await Category.findOne({ name, slug: { $ne: slug } });
  if (category)
    return res.status(400).send({ message: "Category already exists!" });

  // Generate new slug based on updated name
  const newSlug = slugify(name, { lower: true });

  category = await Category.findOneAndUpdate(
    { slug: slug },
    { ...req.body, slug: newSlug },
    { new: true }
  );
  if (!category)
    return res.status(400).send({ message: "Category not found!" });
  res.status(200).send({ message: "Category updated successfully!" });
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

const addSlugToCategories = async () => {
  try {
    // Fetch all categories
    const categories = await Category.find();

    // Iterate over categories and update them with slug
    for (const category of categories) {
      const slug = slugify(category.name, { lower: true });

      // Update category with slug
      await Category.updateOne({ _id: category._id }, { $set: { slug } });
    }

    console.log("Slugs added to all categories successfully!");
  } catch (error) {
    console.error("Error adding slugs to categories:", error);
  }
};

// addSlugToCategories()

module.exports = {
  totalCategories,
  getAllCategories,
  getSingleCategory,
  createCategory,
  deleteCategory,
  updateCategory,
};
