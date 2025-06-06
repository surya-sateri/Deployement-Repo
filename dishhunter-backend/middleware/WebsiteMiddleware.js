// middleware/tenantDbMiddleware.js
import { Tenants } from "../models/MasterTables/MasterTables.js";
import { getTenantConnection } from "../utils/tenantDBConnection.js";

const setRestaurantDb = async (req, res, next) => {
  try {
    const restaurant_id = req.body.restaurant_id;
    console.log("Request Body:", req.body);

    if (!restaurant_id) {
      return res.status(400).json({
        status: false,
        message: "Restaurant ID is missing in request.",
      });
    }

    // Fetch tenant data
    const tenantData = await Tenants.findOne({ restaurant_id });
    if (!tenantData) {
      return res.status(404).json({
        status: false,
        message: "Tenant not found for the given restaurant ID.",
      });
    }

    console.log("Tenant DB Name:", tenantData.dbName);

    // Get tenant-specific DB connection
    const connection = await getTenantConnection(tenantData.dbName);

    // Attach connection to request
    req.tenantConnection = connection;
    next();
  } catch (error) {
    console.error("Tenant Middleware Error:", error);
    return res.status(500).json({
      status: false,
      message: "Tenant database connection failed.",
    });
  }
};

export { setRestaurantDb };
