const blogRouter = require("express").Router();
const {
  addBlog,
  getAllBlogs,
  updateBlog,
  getBlogById,
  deleteBlog,
} = require("../controllers/blog");
const auth = require("../middlewares/userAuth");
const upload = require("../utills/upload");

blogRouter.post("/addBlog", upload.single("image"), addBlog);
blogRouter.get("/getAllBlogs", getAllBlogs);
blogRouter.patch("/updateBlog/:blogId", upload.single("image"), updateBlog);
blogRouter.get("/getBlogById/:blogId", getBlogById);
blogRouter.patch("/deleteBlog/:blogId", deleteBlog);

module.exports = blogRouter;
