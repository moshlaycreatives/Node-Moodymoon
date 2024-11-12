const Brand = require("../models/brand");

exports.createBrand = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Partner Name Is Compulsory" });
    }
    if (req.file) {
      const image = "/" + req.file.path;
      await Brand.create({ image, name });
      return res
        .status(200)
        .json({ success: true, message: "Partner Added Successfully" });
    }
    return res
      .status(400)
      .json({ success: false, message: "Partner Image Is Compulsory" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find({ permanentDeleted: false }).sort({
      createdAt: -1,
    });
    if (!brands) {
      return res
        .status(200)
        .json({ success: true, message: "No Partners Available" });
    }
    return res.status(200).json({ success: true, data: brands });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getBrandById = async (req, res) => {
  try {
    const { brandId } = req.params;
    const brand = await Brand.findOne({
      _id: brandId,
      permanentDeleted: false,
    });
    if (!brand) {
      return res
        .status(400)
        .json({ success: false, message: "No Partner With This Id" });
    }
    return res.status(200).json({ success: true, data: brand });
  } catch (error) {
    return res.status(400).json({ success: true, message: error.message });
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const { brandId } = req.params;
    const { name } = req.body;
    if (req.file) {
      const image = "/" + req.file.path;
      await Brand.findOneAndUpdate(
        { _id: brandId },
        {
          name,
          image,
        }
      );
      return res
        .status(200)
        .json({ success: true, message: "Partner Updated Successfully" });
    }
    await Brand.findOneAndUpdate(
      { _id: brandId },
      {
        name,
      }
    );
    return res
      .status(200)
      .json({ success: true, message: "Partner Updated Successfully" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const { brandId } = req.params;

    await Brand.findOneAndUpdate(
      { _id: brandId },
      {
        permanentDeleted: true,
      }
    );
    return res
      .status(200)
      .json({ success: true, message: "Partner Deleted Successfully" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
