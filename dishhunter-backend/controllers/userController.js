
import {User,SideBar,Role} from "../models/user.js";
import {Users,Category,SubCategory,SuperPermission,Roles} from "../models/MasterTables/MasterTables.js";
import { createJWT } from "../utils/index.js";
import path from 'path';
import fs from 'fs/promises';

export const registerUser = async (req, res) => {
  try {
    const { name, email, primaryphone,secondaryphone,country,state,district,taluka,address,pincode,bankname,accountnumber,ifsccode,branchname,adharnumber,pannumber, password, role_id,restaurent_id } = req.body;
    console.log(req.body)
    const userExist = await User.findOne({ email });

    if (userExist) {
      return res.status(400).json({
        status: false,
        message: "User already exists",
      });
    }

    const user = await User.create({
      name, email, primaryphone,secondaryphone,country,state,district,taluka,address,pincode,
      bankname,accountnumber,ifsccode,branchname,adharnumber,pannumber,
      password, role_id,restaurent_id
    });

    if (user) {
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

export const updateUserDetails = async (req, res) => {
  try {
      const userId = req.params.id;
      const updatedData = req.body;
      const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true });

      if (!updatedUser) {
          return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json(updatedUser);
  } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUserDetailsById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .populate('restaurent_id') // optional: remove if not needed
      .populate('role_id')       // optional: remove if not needed
      .exec();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const updateUserProfile = async (req, res)=>{
  try{
      const {_id,name, email, primaryphone,secondaryphone,country,state,district,taluka,address,pincode,bankname,accountnumber,ifsccode,branchname,adharnumber,pannumber} = req.body;
      const user = await User.findOne({_id});
      if(!_id)
      {
        return res.status(400).json({status:false, message:"User ID is required."})
      }
      if(!user)
      {
        return res.status(404).json({status:false, message:"User not found. Please try again."})
      }
      const updateUser = await User.findByIdAndUpdate(_id,{name, email, primaryphone,secondaryphone,country,state,district,taluka,address,pincode,bankname,accountnumber,ifsccode,branchname,adharnumber,pannumber},{ new: true, runValidators: true })
      return res.status(200).json({status:true,user:updateUser,message:'User details updated successfully.'})
  }
  catch(error){
    return res.status(400).json({status:false, message:error.message})
  }
}
export const uploadUserDocument = async (req, res) => {
  try {
    const { documentType, filename, username, restaurantname } = req.body;

    if (!req.file) {
      return res.status(400).json({
        status: false,
        message: "No file uploaded",
      });
    }

    const originalName = req.file.originalname;
    const filePath = req.file.path;
    const fullNewPath = `uploads\\${restaurantname}_${username}_${filename}`;
    await fs.rename(filePath, fullNewPath);

    res.status(200).json({
      status: true,
      message: "Document uploaded successfully",
      path: fullNewPath,
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);

    const user = await User.findOne({ email })
      // .select("-password") // Exclude password
      .populate("role_id", "role") // Populate role with only the name field
      .populate("restaurent_id", "name"); // Populate restaurant with only the name field

    if (!user) {
      return res
        .status(401)
        .json({ status: false, message: "Invalid email or password." });
    }

    if (!user.isActive) {
      return res.status(401).json({
        status: false,
        message: "User account has been deactivated, contact the administrator",
      });
    }

    const isMatch = await user.matchPassword(password);

    if (isMatch) {
      const token = createJWT(res, user);
      console.log("token", token);
      user.password = undefined;
      // user._id = undefined;
      const sidebar = await SideBar.find();
      res.status(200).json({
        status: true,
        message: "User logged in successfully",
        user,
        token,
        logged: true,
        sidebar
      });
    } else {
      return res
        .status(401)
        .json({ status: false, message: "Invalid email or password", logged: false });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const oldloginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body)
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ status: false, message: "Invalid email or password." });
    }

    if (!user?.isActive) {
      return res.status(401).json({
        status: false,
        message: "User account has been deactivated, contact the administrator",
      });
    }

    const isMatch = await user.matchPassword(password);

    if (user && isMatch) {
      const token = createJWT(res, user);
      console.log('token')
      console.log(token)
      user.password = undefined;
      user._id = undefined;

      res.status(200).json({
        status: true,
        message: "User logged in successfully",
        user,
        token,
        logged:true
      });
    } else {
      return res
        .status(401)
        .json({ status: false, message: "Invalid email or password",logged:false });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.cookie("token", "", {
      htttpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const getUserList = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password") // Exclude password field
      .populate("role_id", "role") // Populate role with only the name field
      .populate("restaurent_id", "name"); // Populate restaurant with only the name field

    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
};


export const addSidebarMenu = async (req, res) => {
  try {
    console.log(req.body);
    const { existingDropdown, title, icon, path, dropdown, isActive, items } = req.body;

    if (existingDropdown) {
      console.log('Adding items to existing dropdown:', existingDropdown);
      
      // Find the existing menu item
      const existingMenuItem = await SideBar.findOne({ title: existingDropdown });

      if (!existingMenuItem) {
        return res.status(404).json({ status: false, message: "Dropdown menu not found" });
      }

      // Append new items to existing items array
      existingMenuItem.items = [...existingMenuItem.items, ...items];

      // Save updated menu item
      await existingMenuItem.save();

      return res.status(200).json({
        status: true,
        message: "Submenu items added successfully",
        menuItem: existingMenuItem,
      });
    }

    // If no existing dropdown, create a new menu item
    const newMenuItem = await SideBar.create({
      title,
      icon,
      path: path || null,
      dropdown: dropdown || false,
      isActive: isActive ?? true,
      items: items || [],
    });

    return res.status(201).json({
      status: true,
      message: "Sidebar menu item added successfully",
      menuItem: newMenuItem,
    });
  } catch (error) {
    console.error("Error in addSidebarMenu:", error.message);
    return res.status(400).json({ status: false, message: error.message });
  }
};
export const updateSidebarMenu = async (req, res) => {
  try {
    const menuId = req.params.id;
    const { title, icon, path, dropdown, isActive, existingDropdown, items } = req.body;

    if (!menuId) {
      return res.status(400).json({ status: false, message: "Menu ID is required" });
    }

    const existingMenu = await SideBar.findById(menuId);

    if (!existingMenu) {
      return res.status(404).json({ status: false, message: "Menu not found" });
    }

    // If updating under an existing dropdown
    if (existingDropdown) {
      const dropdownMenu = await SideBar.findOne({ title: existingDropdown });

      if (!dropdownMenu) {
        return res.status(404).json({ status: false, message: "Dropdown menu not found" });
      }

      dropdownMenu.items = [
        ...dropdownMenu.items.filter(existingItem =>
          !items.some(item => item._id && item._id.toString() === existingItem._id.toString())
        ),
        ...items
      ];

      await dropdownMenu.save();

      // Optionally delete the current menu if it was previously standalone
      await SideBar.findByIdAndDelete(menuId);

      return res.status(200).json({
        status: true,
        message: "Submenu items updated under existing dropdown",
        menuItem: dropdownMenu,
      });
    }

    // If it's a standalone menu (either with or without dropdown items)
    const updatedMenu = await SideBar.findByIdAndUpdate(
      menuId,
      {
        title,
        icon,
        path,
        dropdown: dropdown || false,
        isActive: isActive ?? true,
        items: dropdown ? items : [],
      },
      { new: true }
    );

    return res.status(200).json({
      status: true,
      message: "Sidebar menu updated successfully",
      menuItem: updatedMenu,
    });
  } catch (error) {
    console.error("Error in updateSidebarMenu:", error.message);
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const getSidebarMenu = async (req, res) => {
  try {
    const menuItems = await SideBar.find(); // Fetch all sidebar menu items

    res.status(200).json({
      status: true,
      message: "Sidebar menu fetched successfully",
      menuItems,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ status: false, message: "Error fetching sidebar menu" });
  }
};

export const addCategory = async (req, res) => {
  try {
    const { categoryName, description, isActive, sequence } = req.body;

    const category = await Category.create({
      categoryName,
      description,
      isActive,
      sequence,
    });

    res.status(201).json({
      status: true,
      message: "Category added successfully",
      data: category,
    });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ sequence: 1 });

    res.status(200).json({
      status: true,
      message: "Categories fetched successfully",
      categories,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Error fetching categories" });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params; // Get category ID
    const { categoryName, description, isActive} = req.body;

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { categoryName, description, isActive, updatedAt: Date.now() },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ status: false, message: "Category not found" });
    }

    res.status(200).json({
      status: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Error updating category" });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).json({ status: false, message: "Category not found" });
    }

    res.status(200).json({
      status: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Error deleting category" });
  }
};

export const addSubCategory = async (req, res) => {
  try {
    const { category_id, subCategoryName, description, isActive, sequence } = req.body;
    console.log(req.body)
    const subCategory = await SubCategory.create({
      category_id:'67c21696c103f65ac7bab3e3',
      subCategoryName,
      description,
      isActive,
      sequence,
    });

    res.status(201).json({
      status: true,
      message: "Subcategory added successfully",
      data: subCategory,
    });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const getSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.find().populate("category_id").sort({ sequence: 1 });

    res.status(200).json({
      status: true,
      message: "Subcategories fetched successfully",
      subCategories,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Error fetching subcategories" });
  }
};

export const getSubCategoriesByCategory = async (req, res) => {
  try {
    const { category_id } = req.params; // Get category ID from URL

    const subCategories = await SubCategory.find({ category_id }).sort({ sequence: 1 });

    res.status(200).json({
      status: true,
      message: "Subcategories fetched successfully",
      data: subCategories,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Error fetching subcategories" });
  }
};

export const updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params; // Get subcategory ID
    const { category_id, subCategoryName, description, isActive } = req.body;

    const updatedSubCategory = await SubCategory.findByIdAndUpdate(
      id,
      { category_id, subCategoryName, description, isActive, updatedAt: Date.now() },
      { new: true }
    );

    if (!updatedSubCategory) {
      return res.status(404).json({ status: false, message: "Subcategory not found" });
    }

    res.status(200).json({
      status: true,
      message: "Subcategory updated successfully",
      data: updatedSubCategory,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Error updating subcategory" });
  }
};

export const deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSubCategory = await SubCategory.findByIdAndDelete(id);

    if (!deletedSubCategory) {
      return res.status(404).json({ status: false, message: "Subcategory not found" });
    }

    res.status(200).json({
      status: true,
      message: "Subcategory deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Error deleting subcategory" });
  }
};

export const addSuperPermission = async (req, res) => {
  try {
    const { user_id, restaurent_id, role_id, category_id, subcategory_id, component, access, isActive, sequence } = req.body;

    const permission = await SuperPermission.create({
      user_id,
      restaurent_id,
      role_id,
      category_id,
      subcategory_id,
      component,
      access,
      isActive,
      sequence,
    });

    res.status(201).json({
      status: true,
      message: "Super permission added successfully",
      data: permission,
    });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const getSuperPermissions = async (req, res) => {
  try {
    const permissions = await SuperPermission.find()
      .populate("user_id")
      .populate("restaurent_id")
      .populate("role_id")
      .populate("category_id")
      .populate("subcategory_id")
      .sort({ sequence: 1 });

    res.status(200).json({
      status: true,
      message: "Super permissions fetched successfully",
      permissions,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Error fetching super permissions" });
  }
};

export const getSuperPermissionsByUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    const permissions = await SuperPermission.find({ user_id }).sort({ sequence: 1 });

    res.status(200).json({
      status: true,
      message: "Super permissions fetched successfully for user",
      data: permissions,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Error fetching permissions" });
  }
};

export const updateSuperPermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, restaurent_id, role_id, category_id, subcategory_id, component, access, isActive, sequence } = req.body;

    const updatedPermission = await SuperPermission.findByIdAndUpdate(
      id,
      { user_id, restaurent_id, role_id, category_id, subcategory_id, component, access, isActive, sequence, updatedAt: Date.now() },
      { new: true }
    );

    if (!updatedPermission) {
      return res.status(404).json({ status: false, message: "Super permission not found" });
    }

    res.status(200).json({
      status: true,
      message: "Super permission updated successfully",
      data: updatedPermission,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Error updating super permission" });
  }
};

export const deleteSuperPermission = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPermission = await SuperPermission.findByIdAndDelete(id);

    if (!deletedPermission) {
      return res.status(404).json({ status: false, message: "Super permission not found" });
    }

    res.status(200).json({
      status: true,
      message: "Super permission deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Error deleting super permission" });
  }
};

export const addRole = async (req, res) => {
  try {
    const { role, description, isActive } = req.body;

    // Check if role already exists
    const existingRole = await Role.findOne({ role });
    if (existingRole) {
      return res.status(400).json({ status: false, message: "Role already exists" });
    }

    const newRole = await Role.create({ role, description, isActive });

    res.status(201).json({
      status: true,
      message: "Role added successfully",
      data: newRole,
    });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
};
export const updateRole1 = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, description, isActive } = req.body;

    // Check if the role exists
    const existingRole = await Role.findById(id);
    if (!existingRole) {
      return res.status(404).json({ status: false, message: "Role not found" });
    }

    // Check if new role name (if changed) already exists
    if (role && role !== existingRole.role) {
      const duplicateRole = await Role.findOne({ role });
      if (duplicateRole) {
        return res.status(400).json({ status: false, message: "Role name already exists" });
      }
    }

    // Update fields
    existingRole.role = role || existingRole.role;
    existingRole.description = description || existingRole.description;
    if (isActive !== undefined) {
      existingRole.isActive = isActive;
    }

    const updatedRole = await existingRole.save();

    res.status(200).json({
      status: true,
      message: "Role updated successfully",
      data: updatedRole,
    });

  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const getRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort({ createdAt: -1 });

    res.status(200).json({
      status: true,
      message: "Roles fetched successfully",
      roles,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Error fetching roles" });
  }
};

export const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ status: false, message: "Role not found" });
    }

    res.status(200).json({
      status: true,
      message: "Role fetched successfully",
      data: role,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Error fetching role" });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, description, isActive } = req.body;
    console.log(id)
    console.log(req.body)
    const updatedRole = await Role.findByIdAndUpdate(
      id,
      { role, description, isActive, updatedAt: Date.now() },
      { new: true }
    );

    if (!updatedRole) {
      return res.status(404).json({ status: false, message: "Role not found" });
    }

    res.status(200).json({
      status: true,
      message: "Role updated successfully",
      data: updatedRole,
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ status: false, message: "Error updating role" });
  }
};

export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRole = await Role.findByIdAndDelete(id);

    if (!deletedRole) {
      return res.status(404).json({ status: false, message: "Role not found" });
    }

    res.status(200).json({
      status: true,
      message: "Role deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Error deleting role" });
  }
};
export const getMapUserPermissionData = async (req, res) =>{
  try {
    // Fetch users (for dropdown)
    const users = await User.find({}, "name _id");

    // Fetch categories & subcategories
    const categories = await Category.find({}, "categoryName _id");
    const subcategories = await SubCategory.find({}, "subCategoryName category_id _id");

    res.status(200).json({
      users,
      categories,
      subcategories,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
}

export const mapPermissionsToUser = async (req, res) => {
  try {
    const permissionsData = req.body; // Array of permission objects

    if (!Array.isArray(permissionsData) || permissionsData.length === 0) {
      return res.status(400).json({ status: false, message: "Invalid data format" });
    }

    // Fetch the user details once
    const user = await User.findById(permissionsData[0].userId);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const role_id = user.role_id;
    const restaurent_id = user.restaurent_id;

    // Prepare permission entries
    const newPermissions = permissionsData.map(({ userId, categoryId, subcategoryId, access }) => ({
      user_id: userId,
      role_id,
      restaurent_id,
      category_id: categoryId,
      component:'add',
      subcategory_id: subcategoryId,
      access: access ? "full" : "read", // Assuming `true` means full access
    }));

    // Insert all permissions in one go
    await SuperPermission.insertMany(newPermissions);

    res.status(201).json({ status: true, message: "Permissions mapped successfully!" });
  } catch (error) {
    console.error("Error in mapping permissions:", error);
    res.status(500).json({ status: false, message: error.message });
  }
};
export const getManagePermissions = async (req, res) => {
  try {
    // Fetch users (for dropdown)
    const users = await User.find({}, "name _id");

    // Fetch categories & subcategories
    const categories = await Category.find({}, "categoryName _id");
    const subcategories = await SubCategory.find({}, "subCategoryName category_id _id");

    res.status(200).json({
      users,
      categories,
      subcategories,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};
export const changeUserIsActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['Active', 'Inactive'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values are: ${allowedStatuses.join(', ')}.`,
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isActive: status === 'Active' },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `User status updated to ${status}.`,
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while updating user status.',
      error: error.message,
    });
  }
};
