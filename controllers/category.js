const Category = require("../models/category");

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Category Name Is Compulsory" });
    }
    if (req.file) {
      const image = "/" + req.file.path;
      await Category.create({ image, name });
      return res
        .status(200)
        .json({ success: true, message: "Category Added Successfully" });
    }
    return res
      .status(400)
      .json({ success: false, message: "Category Image Is Compulsory" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const cats = await Category.find({ permanentDeleted: false });
    if (!cats) {
      return res
        .status(200)
        .json({ success: true, message: "No Categories Available" });
    }
    return res.status(200).json({ success: true, data: cats });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const { catId } = req.params;
    const cat = await Category.findOne({ _id: catId, permanentDeleted: false });
    if (!cat) {
      return res
        .status(400)
        .json({ success: false, message: "No Category With This Id" });
    }
    return res.status(200).json({ success: true, data: cat });
  } catch (error) {
    return res.status(400).json({ success: true, message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { catId } = req.params;
    const { name } = req.body;
    if (req.file) {
      const image = "/" + req.file.path;
      await Category.findOneAndUpdate(
        { _id: catId },
        {
          name,
          image,
        }
      );
      return res
        .status(200)
        .json({ success: true, message: "Category Updated Successfully" });
    }
    await Category.findOneAndUpdate(
      { _id: catId },
      {
        name,
      }
    );
    return res
      .status(200)
      .json({ success: true, message: "Category Updated Successfully" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
exports.deleteCategory = async (req, res) => {
  try {
    const { catId } = req.params;

    await Category.findOneAndUpdate(
      { _id: catId },
      {
        permanentDeleted: true,
      }
    );
    return res
      .status(200)
      .json({ success: true, message: "Category Deleted Successfully" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
