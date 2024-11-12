const Blog = require("../models/blog");
const { validateRequiredFields } = require("../utills/validateRequiredFields");

exports.addBlog = async (req, res) => {
  try {
    const { title, author, tags, details } = req.body;
    const requiredFields = ["title", "author", "tags", "details"];
    const missingFieldMessage = validateRequiredFields(
      requiredFields,
      req.body
    );
    if (missingFieldMessage) {
      return res.status(400).json({
        success: false,
        message: missingFieldMessage,
      });
    }
    if (req.file) {
      const image = "/" + req.file.path;
      await Blog.create({ title, author, tags, details, image });
      return res
        .status(200)
        .json({ success: true, message: "Blog Added Successfully" });
    }
    return res
      .status(400)
      .json({ success: false, message: "Please Add One Image Atleast" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ permanentDeleted: false });
    if (!blogs) {
      return res
        .status(200)
        .json({ success: false, message: "No Blogs Available" });
    }
    return res.status(200).json({ success: true, data: blogs });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { title, author, tags, details } = req.body;
    if (req.file) {
      const image = "/" + req.file.path;
      await Blog.findOneAndUpdate(
        { _id: blogId },
        { title, author, tags, details, image }
      );
      return res
        .status(200)
        .json({ success: true, message: "Blog Updated Successfully" });
    }
    await Blog.findOneAndUpdate(
      { _id: blogId },
      { title, author, tags, details }
    );
    return res
      .status(200)
      .json({ success: true, message: "Blog Updated Successfully" });
  } catch (error) {
    return res.status(400).json({ success: true, message: error.message });
  }
};

exports.getBlogById = async (req, res) => {
  try {
    const { blogId } = req.params;
    const blog = await Blog.findOne({ _id: blogId });
    if (!blog) {
      return res
        .status(400)
        .json({ success: false, message: "No Blog With Given Id" });
    }
    return res.status(200).json({ success: true, data: blog });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
exports.deleteBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const blog = await Blog.findOneAndUpdate(
      { _id: blogId },
      { permanentDeleted: true }
    );
    if (!blog) {
      return res
        .status(400)
        .json({ success: false, message: "No Blog With Given Id" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Blog Deleted Successfully" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
