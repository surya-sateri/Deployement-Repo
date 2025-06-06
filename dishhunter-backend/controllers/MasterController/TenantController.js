import {
  Restaurants,
  Tenants,
  Clients,
  Login,
} from "../../models/MasterTables/MasterTables.js";
import {
  Counter,
  CouponData,
  CouponMetaData,
  RestaurantGallery,
} from "../../models/restaurent.js";
import { getTenantRestaurantModels } from "../../models/TenantTables/Restaurants.js";
import { createJWT } from "../../utils/index.js";
import jwt from 'jsonwebtoken';
import { getTenantConnection } from "../../utils/tenantDBConnection.js";
export const AddRestaurant = async (req, res) => {
  try {
    const {
      dbName,
      name,
      email,
      address,
      isActive,
      type,
      district,
      taluka,
      state,
      pincode,
      primaryphone,
      secondaryphone,
      country,
      closeTime,
      openTime,
      establishDate,
    } = req.body;
    console.log("req.body");
    console.log(req.body);
    const restautentExist = await Restaurants.findOne({ email });
    if (restautentExist) {
      return res.status(400).json({
        status: false,
        message: "Restaurant already exists",
      });
    }

    const restaurant = await Restaurants.create({
      name,
      email,
      address,
      isActive,
      district,
      type,
      taluka,
      state,
      pincode,
      primaryphone,
      secondaryphone,
      country,
      closeTime,
      openTime,
      establishDate,
    });

    if (restaurant) {
      const newTenant = await Tenants.create({
        login_id: null,
        restaurant_id: restaurant._id,
        dbName: dbName ? dbName : "",
        dbUrl:
          "mongodb+srv://dishhunter:8t30Xpv4AjXY4c7q@dish-hunter.ot1na.mongodb.net/" +
          dbName +
          "?retryWrites=true&w=majority&appName=dish-hunter",
        active: true,
      });
      res.status(201).json({
        status: true,
        message: "Restaurant added successfully",
      });
    } else {
      return res
        .status(400)
        .json({ status: false, message: "Invalid restaurant data" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};
export const getRestaurantList = async (req, res) => {
  try {
    const restaurents = await Restaurants.find().select(
      "name email address isActive type district taluka state pincode primaryphone secondaryphone country closeTime openTime establishDate discount"
    );
    const fullList = await Promise.all(
      restaurents.map(async (restaurent) => {
        const galleryImage = await RestaurantGallery.findOne({
          restaurent_id: restaurent._id,
          isImage: true,
        }).select("newName ext");

        let imageBase64 = null;

        if (galleryImage && galleryImage.newName) {
          const imagePath = path.join(
            process.cwd(),
            "uploads",
            "restaurent",
            galleryImage.newName
          );

          try {
            const imageBuffer = await fs.readFile(imagePath);
            const base64 = imageBuffer.toString("base64");
            imageBase64 = `data:image\\${galleryImage.ext};base64,${base64}`;
          } catch (readErr) {
            console.warn("Failed to read image file:", readErr.message);
          }
        }

        return {
          ...restaurent._doc,
          image: imageBase64, // will be null if image is not found
        };
      })
    );

    res.status(200).json(fullList);
  } catch (error) {
    console.error("Error in getRestaurentList:", error);
    res.status(400).json({ status: false, message: error.message });
  }
};
export const SoftDeleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ["Active", "Inactive"];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        status: false,
        message: `Invalid status. Allowed values are: ${allowedStatuses.join(
          ", "
        )}.`,
      });
    }

    const updateData = { isActive: status === "Active" };

    const updatedRestaurent = await Restaurants.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedRestaurent) {
      return res.status(404).json({
        status: false,
        message: "Restaurent not found.",
      });
    }

    return res.status(200).json({
      status: true,
      message: `Restaurent is now ${status}.`,
      data: updatedRestaurent,
    });
  } catch (error) {
    console.error("Error updating restaurent status:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong.",
      error: error.message,
    });
  }
};
export const updateRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      address,
      isActive,
      type,
      district,
      taluka,
      state,
      pincode,
      primaryphone,
      secondaryphone,
      country,
      closeTime,
      openTime,
      establishDate,
    } = req.body;

    const restaurantExist = await Restaurants.findOne({ email }, { new: true });

    const restaurantData = await Restaurants.findById(id);
    restaurantData.name = name;
    restaurantData.type = type;
    restaurantData.primaryphone = primaryphone;
    restaurantData.secondaryphone = secondaryphone;
    restaurantData.country = country;
    restaurantData.state = state;
    restaurantData.district = district;
    restaurantData.taluka = taluka;
    restaurantData.address = address;
    restaurantData.closeTime = closeTime;
    restaurantData.openTime = openTime;
    restaurantData.establishDate = establishDate;
    restaurantData.pincode = pincode;
    restaurantData.isActive = isActive;
    await restaurantData.save();

    return res
      .status(200)
      .json({ status: true, message: "Restaurant data updated successfully!" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};
export const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantData = await Restaurants.findById(id).select(
      "name email type primaryphone secondaryphone country state city address pincode isActive"
    );
    res.status(200).json(restaurantData);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};
export const deleteRestaurant = async (req, res) => {
  try {
    const restaurant_id = req.params.id;
    const deleteRestaurant = await Restaurants.findByIdAndDelete(restaurant_id);
    if (!deleteRestaurant) {
      return res.status(404).json({ success: false, message: "Restaurant not found" });
    }

    res.status(200).json({ success: true, message: "Restaurant deleted successfully" });
  } catch (error) {
    console.error("Error deleting restaurant:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const addClient = async (req, res) => {
  try {
    const {
      name,
      email,
      primaryphone,
      secondaryphone,
      country,
      state,
      district,
      taluka,
      address,
      pincode,
      bankname,
      accountnumber,
      ifsccode,
      branchname,
      adharnumber,
      pannumber,
      password,
      restaurant_id,
    } = req.body;
    console.log(req.body);
    const role_id = "67f54e4337c21e3ca9f2421e";
    const loginDetails = await Login.findOne({ email });
    if (loginDetails) {
      return res
        .status(401)
        .json({ status: false, message: "Email is already used." });
    }
    const clientExist = await Clients.findOne({ email });

    if (clientExist) {
      return res.status(400).json({
        status: false,
        message: "Client already exists",
      });
    }

    const client = await Clients.create({
      name,
      email,
      primaryphone,
      secondaryphone,
      country,
      state,
      district,
      taluka,
      address,
      pincode,
      bankname,
      accountnumber,
      ifsccode,
      branchname,
      adharnumber,
      pannumber,
      password,
      restaurant_id,
      role_id,
    });

    if (client) {
      const tenantInfo = await Tenants.findOne({
        restaurant_id: restaurant_id,
      });
      console.log(tenantInfo);
      const newLogin = await Login.create({
        userName: name,
        email,
        userType:'Master',
        password: password,
        user_id: client._id,
        role_id,
        restaurant_id,
        tenant_id: tenantInfo._id || null, // assuming this is optional
      });
      tenantInfo.login_id = newLogin._id;
      tenantInfo.save();
      res.status(201).json({
        status: true,
        message: "Client registered successfully",
      });
    } else {
      return res
        .status(400)
        .json({ status: false, message: "Invalid user data" });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};
export const getClientList = async (req, res) => {
  try {
    const ClientList = await Clients.find().select(
      "name email isAdmin isActive"
    );
    return res.status(200).json(ClientList);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};
export const updateClient = async (req, res) => {
  try {
    const clientId = req.params.id;
    const updatedData = req.body;
    console.log(updatedData);
    const updatedClient = await Clients.findByIdAndUpdate(
      clientId,
      updatedData,
      { new: true }
    );
    console.log(updatedClient);

    if (!updatedClient) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json(updatedData);
  } catch (error) {
    console.error("Error updating client:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const getClientById = async (req, res) => {
  try {
    const clientId = req.params.id;
    if (!clientId || clientId.length !== 24) {
      return res.status(400).json({ message: "Invalid client ID format" });
    }

    const client = await Clients.findById(clientId).populate("restaurant_id");

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json(client);
  } catch (error) {
    console.error("Error fetching client details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const SoftDeleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ["Active", "Inactive"];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values are: ${allowedStatuses.join(
          ", "
        )}.`,
      });
    }

    const updatedClient = await Clients.findByIdAndUpdate(
      id,
      { isActive: status === "Active" },
      { new: true }
    );

    if (!updatedClient) {
      return res.status(404).json({
        success: false,
        message: "Client not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Client status updated to ${status}.`,
      data: updatedClient,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating client status.",
      error: error.message,
    });
  }
};
export const deleteClient = async (req, res) => {
  try {
    const clientId = req.params.id;
    const deletedClient = await Clients.findByIdAndDelete(clientId);
    if (!deletedClient) {
      return res.status(404).json({ success: false, message: "Client not found" });
    }

    res.status(200).json({ success: true, message: "Client deleted successfully" });
  } catch (error) {
    console.error("Error deleting client:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

//Cupon Meta
export const getCouponMetaData = async (req, res) => {
  console.log(req.body)
  try {
    const couponMetaDataList = await CouponMetaData.find().select(
      "discount expiry_date min_purchase max_discount usage_limit used_count isActive"
    );
    console.log(couponMetaDataList)
    return res.status(200).json(couponMetaDataList);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};
export const addCouponMetaData = async (req, res) => {
  try {
    console.log(req.body);
    const {
      restaurent_id,
      discount,
      expiry_date,
      min_purchase,
      max_discount,
      usage_limit,
      used_count,
      isActive,
    } = req.body;

    // Get the next sequence number
    let counter = await Counter.findOneAndUpdate(
      { name: "coupon_id" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const data = await CouponMetaData.create({
      id: counter.seq, // ✅ Assign the generated ID here
      restaurent_id,
      discount,
      expiry_date,
      min_purchase,
      max_discount,
      usage_limit,
      used_count,
      isActive,
    });

    res.status(201).json({
      status: true,
      message: "Coupon meta data added successfully",
      data,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const updateCouponMetaDataById = async (req, res) => {
  try {
    console.log(req.params);
    console.log(req.body);
    const { id } = req.params;
    const {
      discount,
      expiry_date,
      min_purchase,
      max_discount,
      usage_limit,
      used_count,
      isActive,
    } = req.body;
    const couponMetaData = await CouponMetaData.findById(id);
    couponMetaData.restaurent_id = "67b09a1ccc62324a517d78e4";
    couponMetaData.discount = discount;
    couponMetaData.expiry_date = expiry_date;
    couponMetaData.min_purchase = min_purchase;
    couponMetaData.max_discount = max_discount;
    couponMetaData.usage_limit = usage_limit;
    couponMetaData.used_count = used_count;
    couponMetaData.isActive = isActive;
    await couponMetaData.save();

    return res
      .status(200)
      .json({
        status: true,
        message: "Coupon meta data updated successfully!",
      });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
};
export const changeCouponMetaDataIsActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["Active", "Inactive"];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values are: ${allowedStatuses.join(
          ", "
        )}.`,
      });
    }

    const updatedCouponMetaData = await CouponMetaData.findByIdAndUpdate(
      id,
      { isActive: status === "Active" },
      { new: true }
    );

    if (!updatedCouponMetaData) {
      return res.status(404).json({
        success: false,
        message: "Coupon metadata not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Coupon metadata status updated to ${status}.`,
      data: updatedCouponMetaData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating coupon metadata status.",
      error: error.message,
    });
  }
};
export const getCouponMetaDataById = async (req, res) => {
  try {
    const { id } = req.params;
    const couponMetaData = await CouponMetaData.findById(id);

    if (!couponMetaData) {
      return res.status(404).json({ status: false, message: 'Coupon metadata not found' });
    }

    return res.status(200).json(couponMetaData);
  } catch (error) {
    console.error("Error fetching coupon metadata by ID:", error);
    return res.status(400).json({ status: false, message: error.message });
  }
};
export const deleteCouponMetaData = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedCouponMetaData = await CouponMetaData.findByIdAndDelete(id);
    if (!deletedCouponMetaData) {
      return res.status(404).json({ success: false, message: "CouponMetaData not found" });
    }

    res.status(200).json({ success: true, message: "CouponMetaData deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
//
export const getCouponList = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const dbName = decoded?.dbName;
    const connection = await getTenantConnection(dbName);
    const { CouponData } = getTenantRestaurantModels(connection);
    const couponList = await CouponData.find().populate("couponMetaData");
    res.status(200).json({
      status: true,
      message: "Coupon list fetched successfully",
      return: couponList
    });

  } catch (err) {
    console.error("Error fetching coupon list:", err);
    res.status(500).json({
      status: false,
      message: "Failed to fetch coupon list",
      error: err.message
    });
  }
};
export const addCoupon = async (req, res) => {
  try {
    // 1. Get token and decode dbName
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const dbName = decoded?.dbName;

    if (!dbName) {
      return res.status(400).json({ status: false, message: "Tenant DB not found in token" });
    }

    // 2. Get tenant DB connection
    const connection = await getTenantConnection(dbName);

    // 3. Get CouponData model
    const { CouponData } = getTenantRestaurantModels(connection);

    // 4. Create and save coupon
    const newCoupon = new CouponData(req.body);
    await newCoupon.save();

    res.status(201).json({
      status: true,
      message: "Coupon created successfully",
      return: newCoupon
    });

  } catch (err) {
    console.error("Error adding coupon:", err);
    res.status(500).json({
      status: false,
      message: "Failed to add coupon",
      error: err.message
    });
  }
};
export const updateCoupon = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ status: false, message: "Authorization token missing" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const dbName = decoded?.dbName;
    if (!dbName) {
      return res.status(400).json({ status: false, message: "Tenant DB not found in token" });
    }
    const connection = await getTenantConnection(dbName);
    const { CouponData } = getTenantRestaurantModels(connection);
    const couponId = req.params.id;
    if (!couponId) {
      return res.status(400).json({ status: false, message: "Coupon ID is required" });
    }
    const updatedCoupon = await CouponData.findByIdAndUpdate(
      couponId,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedCoupon) {
      return res.status(404).json({ status: false, message: "Coupon not found" });
    }
    res.status(200).json({
      status: true,
      message: "Coupon updated successfully",
      return: updatedCoupon
    });

  } catch (err) {
    console.error("Error updating coupon:", err);
    res.status(500).json({
      status: false,
      message: "Failed to update coupon",
      error: err.message
    });
  }
};
export const deleteCoupon = async (req, res) => {
  try {
    const id = req.params.id;
    console.log("Deleting coupon with ID:", id);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const dbName = decoded?.dbName;
    const connection = await getTenantConnection(dbName);
    const { CouponData } = getTenantRestaurantModels(connection);
    const deletedCouponData = await CouponData.findByIdAndDelete(id);
    console.log("Deleted coupon data:", deletedCouponData);
    if (!deletedCouponData) {
      return res.status(404).json({ success: false, message: "CouponData not found" });
    }

    res.status(200).json({ success: true, message: "CouponData deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};