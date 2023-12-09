const router = require("express").Router();
const {
  getAllCategories,
  getSingleCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryControllers");
const verifyJWT = require("../middlewares/verifyJWT");

router
  .route ("/")
  .get (getAllCategories)
  .post (verifyJWT, createCategory);

router
  .route ("/:id")
  .get (getSingleCategory)
  .patch (updateCategory)
  .delete (verifyJWT, deleteCategory);

module.exports = router;
