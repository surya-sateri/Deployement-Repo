import express from "express";
import { registerClient,getClientList, updateClientDetails,getClientDetailsById, changeClientIsActiveStatus } from "../controllers/clientController.js"; // Update the path if necessary
import { protectRoute } from "../middleware/authMiddlewave.js";

const router = express.Router();

// Define the register route
router.post("/register",protectRoute, registerClient);
router.get("/get-client-list",protectRoute, getClientList);
// update-client
router.put("/update-client/:id", protectRoute, updateClientDetails);
router.get("/get-clientby-id/:id", protectRoute, getClientDetailsById);

router.post('/change-client-is-active-status/:id', protectRoute, changeClientIsActiveStatus)

export default router;

