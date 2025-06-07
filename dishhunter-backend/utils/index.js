
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const dbConnection = async () => {
  console.log("Connecting to MongoDB URI:", process.env.MONGODB_URI);
  try {
    await mongoose.connect(process.env.MONGODB_URI,  { family: 4 });
    console.log("DB connection established: ",process.env.MONGODB_URI);
  } catch (error) {
      const state = mongoose.connection.readyState;
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  console.log(`MongoDB connection state: ${states[state]}`);
    console.log("DB Error: " + error);
  }
};

export const createJWT = (res, user,dbName,userType) => {
  const token = jwt.sign({ user,dbName,userType}, process.env.JWT_SECRET, { expiresIn: "1h"})
  return token;
};

