import { createJWT } from "../../utils/index.js";
import {
  Login,
  Tenants,
  UserNavigationBar,
  Users,
} from "../../models/MasterTables/MasterTables.js";
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user and verify
    const user = await Login.findOne({ email }).populate(
      "restaurant_id",
      "name"
    );
    if (!user) {
      return res
        .status(401)
        .json({ status: false, message: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(401).json({
        status: false,
        message: "User account is deactivated. Contact the administrator.",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ status: false, message: "Invalid email or password" });
    }

    // 2. Get tenant and generate JWT
    const tenant = await Tenants.findOne({ _id: user.tenant_id });
    if (!tenant) {
      return res
        .status(404)
        .json({ status: false, message: "Tenant not found" });
    }

    const token = createJWT(res, user, tenant.dbName, user.userType);
    user.password = undefined;

    // Get user's permitted menu entries
    const userNavEntries = await UserNavigationBar.find({
      login_id: user.user_id,
    }).populate("main_menu_id");

    const sidebarMap = new Map();

    userNavEntries.forEach((entry) => {
      const main = entry.main_menu_id;
      const subId = entry.sub_menu_id; // this is a sub-item's _id

      if (!main || !main.isActive) return;

      const mainId = main._id.toString();

      // Add main menu if not already present
      if (!sidebarMap.has(mainId)) {
        sidebarMap.set(mainId, {
          _id: mainId,
          title: main.title,
          icon: main.icon,
          path: main.path || null,
          dropdown: main.dropdown,
          isActive: main.isActive,
          sequence: main.sequence || 0,
          items: [],
        });
      }

      // Add sub-menu if valid
      if (subId && Array.isArray(main.items)) {
        const matchedSubItem = main.items.find(
          (item) => item._id.toString() === subId.toString()
        );

        if (matchedSubItem && matchedSubItem.isActive) {
          sidebarMap.get(mainId).items.push({
            _id: matchedSubItem._id.toString(),
            title: matchedSubItem.title,
            path: matchedSubItem.path,
            isActive: matchedSubItem.isActive,
            sequence: matchedSubItem.sequence || 0,
          });
        }
      }
    });

    // Convert Map to sorted array
    const sidebar = Array.from(sidebarMap.values()).sort(
      (a, b) => a.sequence - b.sequence
    );
    sidebar.forEach((menu) => {
      menu.items.sort((a, b) => a.sequence - b.sequence);
    });

    // 5. Return response
    return res.status(200).json({
      status: true,
      message: "User logged in successfully",
      user,
      token,
      logged: true,
      sidebar,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};
export const AddUser = async (req, res) => {
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
      role_id,
      restaurant_id,
      userType,
    } = req.body;
    console.log(req.body);

    const loginDetails = await Login.findOne({ email });
    if (loginDetails) {
      return res
        .status(401)
        .json({ status: false, message: "Email is already used." });
    }
    const userExist = await Users.findOne({ email });

    if (userExist) {
      return res.status(400).json({
        status: false,
        message: "User already exists",
      });
    }

    const user = await Users.create({
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
      role_id,
      restaurant_id,
    });

    if (user) {
      // const restautentExist = await Restaurants.findOne({_id:restaurant_id });
      const tenantInfo = await Tenants.findOne({
        restaurant_id: restaurant_id,
      });
      console.log(tenantInfo);
      const newLogin = await Login.create({
        userName: name,
        email,
        password: password,
        user_id: user._id,
        role_id,
        restaurant_id,
        tenant_id: tenantInfo?._id || null,
      });
      console.log(newLogin);

      if (tenantInfo) {
        tenantInfo.login_id = newLogin._id;
        await tenantInfo.save();
      }

      res.status(201).json({
        status: true,
        message: "User registered successfully",
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
export const getUserList = async (req, res) => {
  try {
    const users = await Users.find()
      .select("-password")
      .populate("role_id", "role")
      .populate("restaurent_id", "name");

    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};
export const SoftDeleteUser = async (req, res) => {
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

    const updatedUser = await Users.findByIdAndUpdate(
      id,
      { isActive: status === "Active" },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: `User status updated to ${status}.`,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating user status.",
      error: error.message,
    });
  }
};
export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedData = req.body;
    const updatedUser = await Users.findByIdAndUpdate(userId, updatedData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await Users.findById(id)
      .populate("restaurent_id")
      .populate("role_id")
      .exec();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await Users.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

