import express from "express";
import { getCustomerList, addCustomer, updateCustomer, changeCustomerIsActiveStatus } from "../controllers/customerController.js"; // Update the path if necessary
import { protectRoute } from "../middleware/authMiddlewave.js";

const router = express.Router();

// Define the customers route
router.get("/customers",protectRoute, getCustomerList);
router.post("/customers",protectRoute, addCustomer);
router.put("/customers/:id",protectRoute, updateCustomer);
router.post('/change-customer-is-active-status/:id', protectRoute, changeCustomerIsActiveStatus)
export default router;