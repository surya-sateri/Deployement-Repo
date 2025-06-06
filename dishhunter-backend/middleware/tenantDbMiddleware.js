// middleware/tenantDbMiddleware.js
import { getTenantConnection } from "../utils/tenantDBConnection.js";

const setTenantDb = async (req, res, next) => {
  try {
    const dbName = req.dbName;
    const userType = req.userType;

    console.log('dbNmae',dbName);

    console.log('userType',userType);


    if (!dbName) {
      return res.status(400).json({ status: false, message: "Tenant database name missing in request." });
    }
    if(userType !=='Tenant')
    {
      return res.status(400).json({ status: false, message: "You don't access. Please try again." });
    }
    const connection = await getTenantConnection(dbName);
    req.tenantConnection = connection;
    next();
  } catch (error) {
    console.error("Tenant DB Middleware Error:", error);
    return res.status(500).json({ status: false, message: "Tenant database connection failed." });
  }
};

export { setTenantDb };
