const Product = require("../models/product");
const LabReport = require("../models/labReport");
const { validateRequiredFields } = require("../utills/validateRequiredFields");

exports.addProduct = async (req, res) => {
  try {
    const {
      productName,
      productCategory,
      brand,
      strength,
      quantityPerPack,
      stock,
      price,
      description,
      offer,
      flavor,
      labTestName,
    } = req.body;
    const requiredFields = [
      "productName",
      "productCategory",
      "brand",
      "strength",
      "quantityPerPack",
      "stock",
      "price",
      "description",
      "offer",
      "flavor",
      "labTestName",
    ];
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
    if (req.files) {
      const img = req.files.filter((file) => file.fieldname === "images");
      const lab = req.files.filter((file) => file.fieldname === "labreport");
      const images = img.map((file) => "/" + file.path);
      const labTest = lab.map((file) => "/" + file.path);
      await Product.create({
        productName,
        productCategory,
        brand,
        strength,
        quantityPerPack,
        stock,
        price,
        description,
        offer: JSON.parse(offer),
        images,
        flavor,
        labTest: labTest[0],
        labTestName,
      });
      await LabReport.create({
        labTest: labTest[0],
        labTestName,
        image: images[0],
      });
      return res
        .status(200)
        .json({ success: true, message: "Product Added Successfully" });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Please Add Product Images" });
    }
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ permanentDeleted: false })
      .populate("productCategory")
      .populate("brand");
    if (!products) {
      return res
        .status(400)
        .json({ success: false, message: "No Products Available" });
    }
    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      productName,
      productCategory,
      brand,
      strength,
      quantityPerPack,
      stock,
      price,
      description,
      offer,
      flavor,
      labTestName,
    } = req.body;

    const updateFields = {
      productName,
      productCategory,
      brand,
      strength,
      quantityPerPack,
      stock,
      price,
      description,
      offer: JSON.parse(offer),
      flavor,
      labTestName,
    };

    if (req.files) {
      // Handle images
      const imageFiles = req.files.filter(
        (file) => file.fieldname === "images"
      );
      if (imageFiles.length > 0) {
        updateFields.images = imageFiles.map(
          (file) => "/" + file.path.replace(/\\/g, "/")
        ); // Normalize paths
      }

      // Handle lab report
      const labReportFile = req.files.find(
        (file) => file.fieldname === "labreport"
      );
      if (labReportFile) {
        updateFields.labTest = "/" + labReportFile.path.replace(/\\/g, "/"); // Normalize paths
      }
    }

    await Product.findOneAndUpdate({ _id: productId }, updateFields);

    return res
      .status(200)
      .json({ success: true, message: "Product Updated Successfully" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findOne({
      _id: productId,
      permanentDeleted: false,
    })
      .populate("productCategory")
      .populate("brand");
    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.bestProductStatus = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findOne({ _id: productId });
    if (!product) {
      return res
        .status(400)
        .json({ success: false, message: "No Product With Given Id" });
    }
    if (product.best === false) {
      await Product.findOneAndUpdate({ _id: productId }, { best: true });

      return res
        .status(200)
        .json({ success: true, message: "Product Added To Best Products" });
    }
    await Product.findOneAndUpdate({ _id: productId }, { best: false });

    return res
      .status(200)
      .json({ success: true, message: "Product Removed From Best Products" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findOne({ _id: productId });
    if (!product) {
      return res
        .status(400)
        .json({ success: false, message: "No Product With Given Id" });
    }

    await Product.findOneAndUpdate(
      { _id: productId },
      { permanentDeleted: true }
    );

    return res
      .status(200)
      .json({ success: true, message: "Product Deleted Successfully" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getProductsWithFilter = async (req, res) => {
  try {
    const { status } = req.query;
    if (status === "LOW") {
      const products = await Product.find({ permanentDeleted: false })
        .populate("productCategory")
        .populate("brand")
        .sort({
          price: 1,
        });
      return res.status(200).json({ success: true, data: products });
    } else if (status === "HIGH") {
      const products = await Product.find({ permanentDeleted: false })
        .populate("productCategory")
        .populate("brand")
        .sort({
          price: -1,
        });
      return res.status(200).json({ success: true, data: products });
    } else if (status === "BEST") {
      const products = await Product.find({ best: true })
        .populate("productCategory")
        .populate("brand");
      return res.status(200).json({ success: true, data: products });
    } else {
      return res.status(400).json({ success: false, message: "Invalid Query" });
    }
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const products = await Product.find({
      productCategory: categoryId,
    })
      .populate("productCategory")
      .populate("brand");
    if (!products) {
      return res
        .status(200)
        .json({ success: true, message: "No Products For Given Category" });
    }
    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.availablityProductFilter = async (req, res) => {
  try {
    const availablity = req.query;
    if (availablity === "AVAILABLE") {
      const products = await Product.find({
        stock: { $gt: 0 },
        permanentDeleted: false,
      })
        .populate("productCategory")
        .populate("brand");
      return res.status(200).json({ success: true, data: products });
    } else if (availablity === "UNAVAILABLE") {
      const products = await Product.find({
        stock: { $lte: 0 },
        permanentDeleted: false,
      })
        .populate("productCategory")
        .populate("brand");
      return res.status(200).json({ success: true, data: products });
    }
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllPartnerProducts = async (req, res) => {
  try {
    const { brandId } = req.params;
    const products = await Product.find({ brand: brandId }).sort({
      createdAt: -1,
    });
    if (!products) {
      return res
        .status(200)
        .json({ success: true, message: "No Partner Products Yet" });
    }
    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
