const catRouter = require("express").Router();
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/category");
const auth = require("../middlewares/userAuth");
const upload = require("../utills/upload");

catRouter.post("/createCategory", upload.single("image"), createCategory);
catRouter.get("/getAllCategories", getAllCategories);
catRouter.get("/getCategoryById/:catId", getCategoryById);
catRouter.patch("/deleteCategory/:catId", deleteCategory);
catRouter.patch(
  "/updateCategory/:catId",
  upload.single("image"),
  updateCategory
);

module.exports = catRouter;
