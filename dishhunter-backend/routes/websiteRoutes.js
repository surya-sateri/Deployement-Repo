import express from "express";
import {
    generateCouponCode,
    getMenuByRestaurantId,
    getCouponList,
    addCoupon,
    getAllReviewsByID   
} from "../controllers/restaurentController.js";
import { addReviewAndRating, addTableBooking, getAllBookings } from "../controllers/WebsiteController/WebsiteController.js";
import { setRestaurantDb } from "../middleware/WebsiteMiddleware.js";
import { getRestaurantList } from "../controllers/MasterController/TenantController.js";
const router = express.Router();

router.get("/generate-coupon-code", generateCouponCode);
router.get("/get-restaurant-menu/:id",getMenuByRestaurantId);
router.get("/get-review/:id", getAllReviewsByID);


router.get("/get-coupon-list", getCouponList);
router.post("/add-coupon", addCoupon);

// --------------------------
router.get("/get-bookings", setRestaurantDb, getAllBookings);
router.post("/add-booking", setRestaurantDb, addTableBooking);
router.post('/add-review-and-rating',setRestaurantDb,addReviewAndRating)
router.get("/get-restaurant-list", getRestaurantList);

export default router;