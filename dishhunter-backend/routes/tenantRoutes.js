import express from "express";
import { protectRoute } from "../middleware/authMiddlewave.js";
import { getMenuList } from "../controllers/TenantController/RestaurantController.js";
import { setTenantDb } from "../middleware/tenantDbMiddleware.js";
import { getCouponList ,addCoupon,updateCoupon} from "../controllers/MasterController/TenantController.js";

import { addCouponMetaData, changeCouponMetaDataIsActiveStatus, getCouponMetaData, getCouponMetaDataById, updateCouponMetaDataById,deleteCouponMetaData,deleteCoupon } from "../controllers/MasterController/TenantController.js";

const router = express.Router();

router.get('/get-menu-list',protectRoute,setTenantDb,getMenuList);
router.get("/get-coupon-list", getCouponList);
router.post('/add-coupon',addCoupon)
router.put('/update-coupon/:id',updateCoupon)
router.delete('/delete-coupon/:id', protectRoute, deleteCoupon)

//cupon Meta Data
router.get("/get-coupon-meta-data",protectRoute,getCouponMetaData);
router.get("/get-coupon-meta-data/:id",protectRoute,getCouponMetaDataById);


router.post("/add-coupon-meta-data",protectRoute,addCouponMetaData);
router.post("/update-coupon-meta-data/:id",protectRoute,updateCouponMetaDataById);
router.post('/change-coupon-meta-data-is-active-status/:id', protectRoute, changeCouponMetaDataIsActiveStatus)
router.delete('/delete-coupon-meta-data/:id', protectRoute, deleteCouponMetaData)



export default router;

// import express from "express";
// import { protectRoute } from "../middleware/authMiddlewave.js";
// import { getMenuList } from "../controllers/TenantController/RestaurantController.js";
// import { setTenantDb } from "../middleware/tenantDbMiddleware.js";
// import { getCouponList ,addCoupon,updateCoupon} from "../controllers/MasterController/TenantController.js";

// const router = express.Router();

// router.get('/get-menu-list',protectRoute,setTenantDb,getMenuList);
// router.get("/get-coupon-list", getCouponList);
// router.post('/add-coupon',addCoupon)
// router.put('/update-coupon/:id',updateCoupon)
// export default router;