const Product = require("../models/product");
// const LabReport = require("../models/labReport");
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
      isFeatured,
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
      "isFeatured",
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
        isFeatured,
      });
      // await LabReport.create({
      //   labTest: labTest[0],
      //   labTestName,
      //   image: images[0],
      // });
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
    const { page } = req.query;
    const { status } = req.body;
    const limit = 20;
    const skip = (page - 1) * limit;
    const { Id } = req.body;
    // const { minPrice, maxPrice } = req.body;
    // if (minPrice !== "" || maxPrice !== "") {
    //   const filter = {
    //     permanentDeleted: false,
    //   };

    //   if (minPrice !== "" && maxPrice !== "") {
    //     filter.price = { $gte: minPrice, $lte: maxPrice };
    //   } else if (minPrice !== "") {
    //     filter.price = { $gte: minPrice };
    //   } else if (maxPrice !== "") {
    //     filter.price = { $lte: maxPrice };
    //   }

    //   const products = await Product.find(filter).limit(limit).skip(skip);

    //   return res.status(200).json({
    //     success: true,
    //     data: products,
    //     total: await Product.countDocuments({
    //       filter,
    //     }),
    //   });
    // }

    if (Id && status === "BRAND") {
      const products = await Product.find({
        brand: Id,
        permanentDeleted: false,
      })
        .limit(limit)
        .skip(skip)
        .sort({
          createdAt: -1,
        });
      if (!products) {
        return res
          .status(200)
          .json({ success: true, message: "No Partner Products Yet" });
      }
      return res.status(200).json({
        success: true,
        data: products,
        total: await Product.countDocuments({
          brand: Id,
          permanentDeleted: false,
        }),
      });
    } else if (Id && status === "CATEGORY") {
      const products = await Product.find({
        productCategory: Id,
        permanentDeleted: false,
      })
        .limit(limit)
        .skip(skip)
        .populate("productCategory")
        .populate("brand");
      if (!products) {
        return res
          .status(200)
          .json({ success: true, message: "No Partner Products Yet" });
      }
      return res.status(200).json({
        success: true,
        data: products,
        total: await Product.countDocuments({
          brand: Id,
          permanentDeleted: false,
        }),
      });
    } else if (status === "ALL") {
      const categoryOrder = [
        "THCa Flowers",
        "PreRolls",
        "Edibles",
        "Disposable Vapes",
        "Kratom",
        "THCa Cuban Cigars",
        "Novelities",
      ];

      const aggregationPipeline = [
        { $match: { permanentDeleted: false } },
        {
          $lookup: {
            from: "Category",
            localField: "productCategory",
            foreignField: "_id",
            as: "productCategory",
          },
        },
        {
          $unwind: {
            path: "$productCategory",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "Brand",
            localField: "brand",
            foreignField: "_id",
            as: "brand",
          },
        },
        { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            sortOrder: {
              $indexOfArray: [categoryOrder, "$productCategory.name"],
            },
          },
        },
        { $sort: { sortOrder: 1 } },
        { $skip: skip },
        { $limit: limit },
        { $project: { sortOrder: 0 } },
      ];

      const products = await Product.aggregate(aggregationPipeline);

      if (!products.length) {
        return res
          .status(400)
          .json({ success: false, message: "No Products Available" });
      }

      return res.status(200).json({
        success: true,
        data: products,
        total: await Product.countDocuments({ permanentDeleted: false }),
      });
      // else if (status === "ALL") {
      //   const products = await Product.find({ permanentDeleted: false })
      //     .limit(limit)
      //     .skip(skip)
      //     .populate("productCategory")
      //     .populate("brand");
      //   if (!products) {
      //     return res
      //       .status(400)
      //       .json({ success: false, message: "No Products Available" });
      //   }

      //   return res.status(200).json({
      //     success: true,
      //     data: products,
      //     total: await Product.countDocuments({ permanentDeleted: false }),
      //   });
    } else if (status === "AVAILABLE") {
      const products = await Product.find({
        stock: { $gt: 0 },
        permanentDeleted: false,
      })
        .limit(limit)
        .skip(skip)
        .populate("productCategory")
        .populate("brand");
      return res.status(200).json({
        success: true,
        data: products,
        total: await Product.countDocuments({
          stock: { $gt: 0 },
          permanentDeleted: false,
        }),
      });
    } else if (status === "UNAVAILABLE") {
      const products = await Product.find({
        stock: { $lte: 0 },
        permanentDeleted: false,
      })
        .limit(limit)
        .skip(skip)
        .populate("productCategory")
        .populate("brand");
      return res.status(200).json({
        success: true,
        data: products,
        total: await Product.countDocuments({
          stock: { $lte: 0 },
          permanentDeleted: false,
        }),
      });
    } else if (status === "LOW") {
      const products = await Product.find({ permanentDeleted: false })
        .limit(limit)
        .skip(skip)
        .populate("productCategory")
        .populate("brand")
        .sort({
          price: 1,
        });
      return res.status(200).json({
        success: true,
        data: products,
        total: await Product.countDocuments({
          permanentDeleted: false,
        }),
      });
    } else if (status === "HIGH") {
      const products = await Product.find({ permanentDeleted: false })
        .limit(limit)
        .skip(skip)
        .populate("productCategory")
        .populate("brand")
        .sort({
          price: -1,
        });
      return res.status(200).json({
        success: true,
        data: products,
        total: await Product.countDocuments({
          permanentDeleted: false,
        }),
      });
    } else if (status === "BEST") {
      const products = await Product.find({
        best: true,
        permanentDeleted: false,
      })
        .limit(limit)
        .skip(skip)
        .populate("productCategory")
        .populate("brand");
      return res.status(200).json({
        success: true,
        data: products,
        total: await Product.countDocuments({
          permanentDeleted: false,
          best: true,
        }),
      });
    } else {
      return res.status(400).json({ success: false, message: "Invalid Query" });
    }
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
      isFeatured,
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
      isFeatured,
    };
    // console.log("|||||||||||||||", req.files);
    if (req.files) {
      const imageFiles = req.files.filter(
        (file) => file.fieldname === "images"
      );
      if (imageFiles.length > 0) {
        updateFields.images = imageFiles.map(
          (file) => "/" + file.path.replace(/\\/g, "/")
        );
      }

      const labReportFile = req.files.find(
        (file) => file.fieldname === "labreport"
      );
      // console.log(labReportFile, ">>>>>>>>>>>");
      if (labReportFile) {
        updateFields.labTest = "/" + labReportFile.path.replace(/\\/g, "/");
      }
    }

    await Product.findOneAndUpdate({ _id: productId }, updateFields);

    return res
      .status(200)
      .json({ success: true, message: "Product Updated Successfully" });
  } catch (error) {
    // console.log(error);
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

exports.searchApi = async (req, res) => {
  try {
    const search = req.query.search;
    if (search) {
      let data = await Product.find({
        $or: [
          { productName: new RegExp(search, "i"), permanentDeleted: false },
        ],
      });
      if (data.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "OOPS! No Product Found" });
      }
      return res
        .status(200)
        .json({ success: true, count: data.length, data: data });
    } else if (search === " ") {
      return res
        .status(404)
        .json({ success: false, message: "OOPS! No Product Found" });
    }
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true });
    if (products.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No Featured Products Yet",
      });
    }

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
