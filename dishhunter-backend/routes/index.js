import express from "express";
import userRoutes from "./userRoutes.js";
import clientRoutes from "./clientRoutes.js";
import restaurentRout from "./restaurentRout.js";
import websiteRoutes from "./websiteRoutes.js"
import customerRoutes from "./customerRoutes.js"
import masterRoutes from "./masterRoutes.js";
import tenantRoutes from "./tenantRoutes.js";
const router = express.Router();

router.use("/user", userRoutes);
router.use("/customer", customerRoutes);
router.use("/client", clientRoutes);
router.use("/restaurent", restaurentRout);
router.use("/website", websiteRoutes);
router.use("/master", masterRoutes);
router.use("/tenant", tenantRoutes);

export default router;
