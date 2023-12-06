const { Category, validateCategory} = require("../models/Category")
const asyncHandler = require("express-async-handler")

// GET ALL CATEGORIES
const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find();
  
  if (!categories?.length) {
    return res.status(400).send({ message: "No category found!" });
  }

  // Capitalize only the first character of each category name
  const capitalizedCategories = categories.map(category => {
    return {
      ...category.toObject(),
      name: category.name.charAt(0).toUpperCase() + category.name.slice(1)
    };
  });

  res.status(200).send(capitalizedCategories);
});

// GET SINGLE CATEGORY
const getSingleCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
  if (!category) return res.status(400).send({message: "Category not found!"})

  // CAPITALIZED NAME PROPERTY
  const capitalizedCategory = {
    ...category.toObject(),
    name: category.name.charAt(0).toUpperCase() + category.name.slice(1)
  }
  res.status(200).send(capitalizedCategory)
})


// POST [ NEW CATEGORY ]
const createCategory = asyncHandler(async (req, res) => {
  const {name} = req.body

  // JOI VALIDATION CHECK
  const {error} = validateCategory(req.body)
  if (error) return res.status(400).send({message: error.details[0].message})

  // DUPLICATION CHECK
  let category = await Category.findOne({name})
  if (category) return res.status(400).send({message: "Category already exists!"})

  category = new Category(req.body)
  await category.save()
  res.status(200).send({message: "Category created succssfully!"})
})

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id)
  if (!category) return res.status(400).send({message: "No category found!"})
  res.status(200).send({message: "Category deleted successfully!"})
})

const updateCategory = asyncHandler(async (req, res) => {
  const {name} = req.body;
  const id = req.params.id;

  const {error} = validateCategory(req.body)
  if (error) return res.status(200).send({message: error.details[0].message})

  let category = await Category.findOne({name, _id: { $ne: id}})
  if (category) return res.status(400).send({message: "Category already exists!"})

  category = await Category.findByIdAndUpdate(id, req.body, {new: true})
  if (!category) return res.status(400).send({message: "Category not found!"})
  res.status(200).send({message: "Category updated successfully!"})
})



module.exports = {
  getAllCategories,
  getSingleCategory,
  createCategory,
  deleteCategory,
  updateCategory
}