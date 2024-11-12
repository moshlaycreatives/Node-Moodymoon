const brandRouter = require("express").Router();
const {
  createBrand,
  getAllBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
} = require("../controllers/brand");
const auth = require("../middlewares/userAuth");
const upload = require("../utills/upload");

brandRouter.post("/createBrand", upload.single("image"), createBrand);
brandRouter.get("/getAllBrands", getAllBrands);
brandRouter.get("/getBrandById/:brandId", getBrandById);
brandRouter.patch("/updateBrand/:brandId", upload.single("image"), updateBrand);
brandRouter.patch("/deleteBrand/:brandId", deleteBrand);

module.exports = brandRouter;
