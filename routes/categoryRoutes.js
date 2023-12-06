const router = require("express").Router()
const categoryControllers = require("../controllers/categoryControllers")

router.route("/")
  .get(categoryControllers.getAllCategories)
  .post(categoryControllers.createCategory)

router.route("/:id")  
  .get(categoryControllers.getSingleCategory)
  .patch(categoryControllers.updateCategory)
  .delete(categoryControllers.deleteCategory)

module.exports = router;  