import express from "express";
import {
    registerRestaurent,
    getRestaurentList,
    addBookings,
    getBookingList,
    updateBookingDetails,
    // generateCouponCode,
    addRestaurentMenu,
    updateMenu,
    // getCouponMetaData,
    // updateCouponMetaDataById,
    // addCouponMetaData,
    getAllReviews,
    addReview,
    updateReview,
    getReviewById,
    getReviewByRestaurantId,
    getRestaurantById,
    updateRestaurantById,
    changeBookingStatus,
    addRestarantDetails,
    changeRestarauntIsActiveStatus,
    changeBookingIsActiveStatus,
    changeRestaurantMenuIsActiveStatus,
    changeReviewIsActiveStatus,
    // changeCouponMetaDataIsActiveStatus,
    getNearbyRestaurants,
} from "../controllers/restaurentController.js";
import { protectRoute } from "../middleware/authMiddlewave.js";
import multer from 'multer';
// import { createMember, deleteMember, getAllMembers, updateMember } from "../controllers/TenantController/RestaurantController.js";

const upload = multer({ dest: 'uploads/' });
const router = express.Router();


router.post("/register",protectRoute, registerRestaurent);
router.get("/get-restaurent-list",protectRoute, getRestaurentList);
router.get('/get-restaurant/:id', protectRoute, getRestaurantById);
router.post('/update-restaurant/:id', protectRoute, updateRestaurantById);
router.post('/add-Restarant-Details',upload.single('file'),protectRoute, addRestarantDetails);
router.post('/change-restaurant-is-active-status/:id', protectRoute, changeRestarauntIsActiveStatus)



router.get("/get-all-reviews", protectRoute, getAllReviews);
router.get('/get-restaurant-review/:id', protectRoute, getReviewByRestaurantId);

router.post("/add-review", protectRoute, addReview);
router.post('/update-review/:id', protectRoute, updateReview);
router.get('/get-review/:id', protectRoute, getReviewById);
router.post('/change-review-is-active-status/:id', protectRoute, changeReviewIsActiveStatus)

router.post('/update-booking-details/:id',protectRoute,updateBookingDetails)
router.get("/get-booking-list",protectRoute, getBookingList);
router.post('/change-booking-is-active-status/:id', protectRoute, changeBookingIsActiveStatus)
// get-bookingbyid

router.post("/restaurent-menu",protectRoute,addRestaurentMenu);
router.post("/update-restaurent-menu/:id",protectRoute,updateMenu);
router.post('/change-restaurant-booking-menu-is-active-status/:id', protectRoute, changeRestaurantMenuIsActiveStatus)

 
// router.get("/coupon-meta-data",protectRoute,getCouponMetaData);
// router.post("/coupon-meta-data",protectRoute,addCouponMetaData);
// router.post("/coupon-meta-data/:id",protectRoute,updateCouponMetaDataById);
// router.post('/change-coupon-meta-data-is-active-status/:id', protectRoute, changeCouponMetaDataIsActiveStatus)


router.post("/change-status/:bookingId",protectRoute,changeBookingStatus);
// get-couponmetadata-byrestaurentid

// get-coupon-list
// update-coupon-details
// add-coupon

// search resturant
router.get("/get-nearby-restaurants", getNearbyRestaurants);


// router.get("/get-members",protectRoute,getAllMembers);
// router.post("/add-member",protectRoute,createMember);
// router.put("/update-member/:id",protectRoute,updateMember);
// router.delete("/delete-member",protectRoute,deleteMember);


export default router;