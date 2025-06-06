import jwt from "jsonwebtoken";
import {User} from "../models/user.js";
import { Login } from "../models/MasterTables/MasterTables.js";

const protectRoute = async (req, res, next) => {
  console.log('protectRoute middleware hit:', req.url);
  try {

    let token = req.headers.authorization?.split(" ")[1];
   // let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjY4MjYzYjZlMzAzNzNmMDJlYzk0ZWM0ZSIsInVzZXJOYW1lIjoiYXRpdGhpIiwiZW1haWwiOiJhdGl0aGlAZ21haWwuY29tIiwicGFzc3dvcmQiOiIkMmEkMTAkdUMvdExrb0VyeThUWUJuTnhHa01NT3V6MTgudnJ2MjY3VE9CNE5GVEtNVFdzVkJNSjJJM3kiLCJ1c2VyVHlwZSI6IlRlbmFudCIsInRlbmFudF9pZCI6IjY4MjYzOTQxMGNmOWE5OWI0ZGRkNjdlMSIsInJlc3RhdXJhbnRfaWQiOm51bGwsInJvbGVfaWQiOiI2N2MyMGUyNTg1ODY0NWMwYjYyODhmNTAiLCJpc0FjdGl2ZSI6dHJ1ZSwiY3JlYXRlZEF0IjoiMjAyNS0wNS0xNVQxOTowNzoyNi40OTlaIiwidXBkYXRlZEF0IjoiMjAyNS0wNS0xNVQxOTowNzoyNi40OTlaIiwiX192IjowfSwiZGJOYW1lIjoiYXRpdGhpIiwidXNlclR5cGUiOiJUZW5hbnQiLCJpYXQiOjE3NDgzNDIxMjgsImV4cCI6MTc0ODM0NTcyOH0.eRypxGxImk5VOdC9NjI8b98JeNspIEElgQ7ths-mtcI'
    console.log('Token received:', token ? 'Yes' : 'No');
    
    if (!token) {
      return res.status(401).json({ success: false, message: "Access denied. No token provided." });
    }
    
    // Verify the token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded:', {
      hasUser: !!decodedToken.user,
      hasUserId: !!decodedToken.user?._id,
      dbName: decodedToken.dbName
    });
    
    req.dbName = decodedToken.dbName;
    if (!decodedToken.user || !decodedToken.user._id) {
      return res.status(401).json({ success: false, message: "Invalid token. Please log in again." });
    }
    
    // Fetch user details from DB
    const user = await Login.findById(decodedToken.user._id).select("email");
    console.log('User found in DB:', {
      found: !!user,
      userId: user?._id
    });
    
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found. Please log in again." });
    }
    
    // Attach user data to request object
    req.user = {
      _id: user._id,
      email: user.email,
    };
    console.log('User attached to request:', {
      userId: req.user._id,
      email: req.user.email
    });

    next();
  } catch (error) {
    console.error("Authentication Error:", error);
    let message = "Authorization failed. Please log in again.";
    if (error.name === "TokenExpiredError") {
      message = "Session expired. Please log in again.";
    } else if (error.name === "JsonWebTokenError") {
      message = "Invalid token. Please log in again.";
    }
    return res.status(401).json({ success: false, message });
  }
};

const isMasterRoute = async (req, res, next) => {
  try {
    let token = req.headers.authorization?.split(" ")[1];
    // Check if the token exists
    if (!token) {
      return res.status(401).json({ success: false, message: "Access denied. No token provided." });
    }
    // Verify the token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken.user || !decodedToken.user._id) {
      return res.status(401).json({ success: false, message: "Invalid token. Please log in again." });
    }
    // Fetch user details from DB
    const user = await Login.findById(decodedToken.user._id).select("userType");
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found. Please log in again." });
    }
    // Check if user is an admin
    if (user['userType'] === 'Tenant') {
      return res.status(403).json({ success: false, message: "Access denied. Master can access only." });
    }
    // Attach user data to request object
    req.user = {
      userId: user._id,
      email: user.email,
      isAdmin:'',
    };
    next();
  } catch (error) {
    console.error("Authorization Error:", error);
    let message = "Authorization failed. Please log in again.";
    if (error.name === "TokenExpiredError") {
      message = "Session expired. Please log in again.";
    } else if (error.name === "JsonWebTokenError") {
      message = "Invalid token. Please log in again.";
    }
    return res.status(401).json({ success: false, message });
  }
};

export { isMasterRoute, protectRoute };