const router = require("express").Router();
const {
  getAllCategories,
  getSingleCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryControllers");
const verifyJWT = require("../middlewares/verifyJWT");
const checkRoles = require("../middlewares/checkRoles")

const checkAdmin = checkRoles(["Publisher", "Admin"])
const checkPublisher = checkRoles(["Publisher"])

router
  .route ("/")
  .get (getAllCategories)
  .post (verifyJWT, checkPublisher, createCategory);

router
  .route ("/:id")
  .get (verifyJWT, getSingleCategory)
  .patch (verifyJWT, updateCategory)
  .delete (verifyJWT, checkAdmin, deleteCategory);

module.exports = router;
