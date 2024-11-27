const productRouter = require("express").Router();
const {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  bestProductStatus,
  getProductsWithFilter,
  getProductsByCategory,
  availablityProductFilter,
  deleteProduct,
  getAllPartnerProducts,
  searchApi,
} = require("../controllers/product");
const auth = require("../middlewares/userAuth");
const upload = require("../utills/upload");

productRouter.post("/addProduct", upload.any(), addProduct);
productRouter.post("/searchApi", searchApi);
productRouter.post("/getAllProducts", getAllProducts);
productRouter.get("/getProductById/:productId", getProductById);
productRouter.get("/getAllPartnerProducts/:brandId", getAllPartnerProducts);
productRouter.patch("/updateProduct/:productId", upload.any(), updateProduct);
productRouter.patch("/bestProductStatus/:productId", bestProductStatus);
productRouter.patch("/deleteProduct/:productId", deleteProduct);
productRouter.get("/getProductsWithFilter", getProductsWithFilter);
productRouter.get("/getProductsByCategory/:categoryId", getProductsByCategory);
productRouter.get("/availablityProductFilter", availablityProductFilter);

module.exports = productRouter;
