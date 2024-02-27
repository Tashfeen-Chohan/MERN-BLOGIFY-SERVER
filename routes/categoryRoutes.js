const router = require("express").Router();
const {
  getAllCategories,
  getSingleCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  totalCategories,
} = require("../controllers/categoryControllers");
const verifyJWT = require("../middlewares/verifyJWT");
const checkRoles = require("../middlewares/checkRoles")

const checkAdmin = checkRoles(["Admin", "Publisher"])
const checkPublisher = checkRoles(["Publisher"])

router
  .route ("/")
  .get (getAllCategories)
  .post (verifyJWT, checkPublisher, createCategory);

// router.route("/:slug").get(getSingleCategory)

router
  .route ("/total-categories").get(totalCategories)

router
  .route ("/:slug")
  .get(getSingleCategory)
  .patch (verifyJWT, checkAdmin, updateCategory)

router.route("/:id").delete (verifyJWT, checkAdmin, deleteCategory);

module.exports = router;
