// utils/TenantManager.js
import mongoose from "mongoose";
import { Tenants } from "../models/MasterTables/MasterTables.js";

const getTenantConnection = async (dbName) => {
  // Load metadata from master DB
  const tenant = await Tenants.findOne({ dbName });
   
  console.log('tenant',tenant);
  

  if (!tenant) throw new Error("Tenant not found");
  console.log("New db connected: ",tenant.dbUrl)
  const conn = mongoose.createConnection(tenant.dbUrl, { dbName });
  await new Promise((resolve, reject) => {
    conn.once("open", resolve);
    conn.once("error", reject);
  });

  return conn;
};

export { getTenantConnection };
