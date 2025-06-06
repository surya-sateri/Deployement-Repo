import mongoose from "mongoose";
import {
  NavigationBar,
  Roles,
  UserNavigationBar,
  Action,
  Login,
} from "../../models/MasterTables/MasterTables.js";

export const GetRoleList = async (req, res) => {
  try {
    const roles = await Roles.find();
    if (!roles) {
      return res
        .status(401)
        .json({ status: false, message: "No roles in database" });
    }
    return res
      .status(200)
      .json({
        status: true,
        message: "Roles fetched successfullly",
        roles: roles,
      });
  } catch (error) {
    console.error("Error fetching roles", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const CreateRole = async (req, res) => {
  try {
    const { role, description, isActive } = req.body;
    console.log(typeof role);

    // Check if role already exists
    const existingRole = await Roles.findOne({ role: role });
    if (existingRole) {
      return res.status(400).json({
        status: false,
        message: "Role already exists",
      });
    }

    // Create new role
    const newRole = await Roles.create({
      role,
      description,
      isActive,
    });

    res.status(201).json({
      status: true,
      message: "Role created successfully",
      data: newRole,
    });
  } catch (error) {
    console.error("Error creating role:", error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const GetNavigationBarList = async (req, res) => {
  try {
    const navigationBar = await NavigationBar.find();

    // Log all menus and their submenus
    console.log(
      "Navigation Bar List from DB:",
      navigationBar.map((menu) => ({
        id: menu._id,
        title: menu.title,
        isActive: menu.isActive,
        dropdown: menu.dropdown,
        items:
          menu.items?.map((item) => ({
            id: item._id,
            title: item.title,
            isActive: item.isActive,
            dropdown: item.dropdown,
          })) || [],
      }))
    );

    // Log all menu IDs including submenu IDs
    const allMenuIds = navigationBar.reduce((acc, menu) => {
      acc.push(menu._id.toString());
      if (menu.items && menu.items.length > 0) {
        menu.items.forEach((item) => {
          acc.push(item._id.toString());
        });
      }
      return acc;
    }, []);

    console.log("All menu IDs in DB (including submenus):", allMenuIds);

    res.status(200).json({ success: true, navigationBar: navigationBar || [] });
  } catch (error) {
    console.error("Error fetching navigation bar:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
export const getNavigationBarItemById = async (req, res) => {
  try {
    const { id } = req.params;

    // First, try to find a top-level navigation item
    const topLevelItem = await NavigationBar.findById(id);

    if (topLevelItem) {
      return res.status(200).json({
        success: true,
        message: "Top-level navigation item fetched successfully",
        item: topLevelItem,
      });
    }

    // If not found, look for a submenu item
    const menuWithSubItem = await NavigationBar.findOne({ "items._id": id });

    if (!menuWithSubItem) {
      return res.status(404).json({ success: false, message: "Navigation item not found" });
    }

    const subItem = menuWithSubItem.items.find(
      (item) => item._id.toString() === id
    );

    if (!subItem) {
      return res.status(404).json({ success: false, message: "Submenu item not found" });
    }

    res.status(200).json({
      success: true,
      message: "Submenu item fetched successfully",
      item: subItem,
    });
  } catch (error) {
    console.error("Error fetching navigation item:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const UpdateNavigationBar = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Try updating a top-level menu item first
    const updatedTopLevel = await NavigationBar.findOneAndUpdate(
      { _id: id },
      { $set: updateData },
      { new: true }
    );

    if (updatedTopLevel) {
      return res.status(200).json({
        success: true,
        message: "Top-level navigation item updated successfully",
        updatedItem: updatedTopLevel,
      });
    }

    // If not a top-level item, search for a submenu item
    const menuWithSubItem = await NavigationBar.findOne({ "items._id": id });

    if (!menuWithSubItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    const itemIndex = menuWithSubItem.items.findIndex(
      (item) => item._id.toString() === id
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Submenu item not found" });
    }

    // Update the found submenu item
    Object.assign(menuWithSubItem.items[itemIndex], updateData);
    await menuWithSubItem.save();

    res.status(200).json({
      success: true,
      message: "Submenu item updated successfully",
      updatedItem: menuWithSubItem.items[itemIndex],
    });
  } catch (error) {
    console.error("Error updating navigation item:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const AddAccessModulesToUserOrClient = async (req, res) => {
  try {
    const { users, tenant_id, restaurant_id, permissions, createdBy } =
      req.body;

    if (!users || !Array.isArray(users) || users.length === 0) {
      return res.status(400).json({
        status: false,
        message: "Users array is required and must not be empty.",
      });
    }

    if (
      !permissions ||
      !Array.isArray(permissions) ||
      permissions.length === 0
    ) {
      return res.status(400).json({
        status: false,
        message: "Permissions array is required and must not be empty.",
      });
    }

    const inserts = [];

    for (const login_id of users) {
      if (!login_id) continue;

      for (const perm of permissions) {
        if (!perm || !perm.main_menu_id) continue;

        const { main_menu_id, sub_menu_id = null, isDropdown = false } = perm;

        const query = {
          login_id,
          main_menu_id,
          sub_menu_id,
        };
        if (tenant_id) query.tenant_id = tenant_id;
        if (restaurant_id) query.restaurant_id = restaurant_id;

        try {
          const exists = await UserNavigationBar.findOne(query);

          if (!exists) {
            const insertData = {
              login_id,
              main_menu_id,
              sub_menu_id,
              isDropdown,
              permissions: '',
              createdBy: createdBy || null,
            };
            if (tenant_id) insertData.tenant_id = tenant_id;
            if (restaurant_id) insertData.restaurant_id = restaurant_id;

            inserts.push(insertData);
          }
        } catch (dbError) {
          console.error(
            "Database error while checking existing permission:",
            dbError
          );
          continue;
        }
      }
    }

    if (inserts.length > 0) {
      try {
        const result = await UserNavigationBar.insertMany(inserts);
        return res.status(201).json({
          status: true,
          message: `${result.length} access modules assigned successfully.`,
          data: result,
        });
      } catch (insertError) {
        console.error("Error inserting permissions:", insertError);
        return res.status(500).json({
          status: false,
          message: "Error saving permissions to database.",
          error: insertError.message,
        });
      }
    }

    return res.status(200).json({
      status: true,
      message: "All selected permissions already exist for the selected users.",
    });
  } catch (error) {
    console.error("Error in AddAccessModulesToUserOrClient:", error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const UpdateAccessModuleToUserOrClient = async (req, res) => {
  try {
    const { userId } = req.params;
    const { permissions } = req.body;

    if (!userId) {
      return res.status(400).json({
        status: false,
        message: "User ID is required",
      });
    }

    if (!permissions || !Array.isArray(permissions)) {
      return res.status(400).json({
        status: false,
        message: "Permissions array is required",
      });
    }

    await UserNavigationBar.deleteMany({ login_id: userId });

    const newPermissions = permissions.map((perm) => ({
      login_id: userId,
      main_menu_id: perm.main_menu_id,
      sub_menu_id: perm.sub_menu_id || null,
      isDropdown: perm.isDropdown || false,
      permissions: '',
      createdBy: req.user?._id,
    }));

    if (newPermissions.length > 0) {
      await UserNavigationBar.insertMany(newPermissions);
    }

    return res.status(200).json({
      status: true,
      message: "User permissions updated successfully",
      data: {
        updatedPermissions: newPermissions,
      },
    });
  } catch (error) {
    console.error("Error updating user permissions:", error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
export const deleteAccess = async (req, res) => {
  try {
    const { id } = req.params; // ✅ extract id string
    
    const deletedAccess = await UserNavigationBar.findByIdAndDelete({login_id: id}); 
    if (!deletedAccess) {
      return res.status(404).json({ success: false, message: 'Access not found' });
    }

    res.status(200).json({ success: true, message: 'Access deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};




export const GetUserNavigationBar = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        status: false,
        message: "User ID is required",
      });
    }

    const userPermissions = await UserNavigationBar.find({ login_id: userId });

    if (!userPermissions || userPermissions.length === 0) {
      return res.status(200).json({
        status: true,
        message: "No navigation bar permissions found for user",
        navigationBar: [],
      });
    }

    const allNavItems = await NavigationBar.find();
    const userNavItems = allNavItems.filter((navItem) => {
      const hasMainPermission = userPermissions.some(
        (perm) => perm.main_menu_id.toString() === navItem._id.toString()
      );

      if (hasMainPermission) {
        if (navItem.items && navItem.items.length > 0) {
          navItem.items = navItem.items.filter((subItem) =>
            userPermissions.some(
              (perm) => perm.sub_menu_id === subItem._id.toString()
            )
          );
        }
        return true;
      }
      return false;
    });

    return res.status(200).json({
      status: true,
      message: "User navigation bar fetched successfully",
      navigationBar: userNavItems,
    });
  } catch (error) {
    console.error("Error fetching user navigation bar:", error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ---------------------Add sathi list---------------------
export const GetActionPermissionAdd = async (req, res) => {
  try {
    const { id } = req.body;
    console.log(req.body)
    const userNavEntries = await UserNavigationBar.find({
      login_id: id,
    })
      .populate("main_menu_id")
      .lean();

    // Unique menu & submenu IDs
    const mainMenuIds = [
      ...new Set(
        userNavEntries.map((entry) => entry.main_menu_id?._id?.toString()).filter(Boolean)
      ),
    ];
    const subMenuIds = userNavEntries
      .map((entry) => entry.sub_menu_id)
      .filter(Boolean);

    // Fetch Actions for all relevant menus/submenus
    const actionsData = await Action.find({
      $or: [
        { main_menu_id: { $in: mainMenuIds }, sub_menu_id: null }, // for non-dropdowns
        { main_menu_id: { $in: mainMenuIds }, sub_menu_id: { $in: subMenuIds } }, // for dropdowns
      ],
    }).lean();

    const actionMap = {};
    actionsData.forEach((action) => {
      const mainId = action.main_menu_id?.toString();
      const subId = action.sub_menu_id?.toString() || null;
      if (!actionMap[mainId]) actionMap[mainId] = {};
      actionMap[mainId][subId] = action.Actions || [];
    });

    // Build final structure
    const grouped = {};

    for (const entry of userNavEntries) {
      const mainMenu = entry.main_menu_id;
      if (!mainMenu) continue;
      const mainId = mainMenu._id.toString();
      const isDropdown = mainMenu.dropdown;

      if (!grouped[mainId]) {
        grouped[mainId] = {
          main_menu_id: mainId,
          main_menu_name: mainMenu.title,
          actions: !isDropdown
            ? actionMap[mainId]?.[null] || []
            : [], // only attach actions at main level if not a dropdown
          sub_menu_list: [],
        };
      }

      // If it's a dropdown, add submenu with its actions
      if (isDropdown && entry.sub_menu_id) {
        const subId = entry.sub_menu_id.toString();
        const subName =
          mainMenu.items?.find(
            (item) =>
              item._id?.toString() === subId || item.title === subId
          )?.title || subId;

        grouped[mainId].sub_menu_list.push({
          sub_menu_id: subId,
          sub_menu_name: subName,
          permissions: entry.permissions || "",
          actions: actionMap[mainId]?.[subId] || [],
        });
      } else if (!isDropdown) {
        // Non-dropdowns can have at most one item in sub_menu_list
        if (grouped[mainId].sub_menu_list.length === 0) {
          grouped[mainId].sub_menu_list.push({
            sub_menu_id: null,
            sub_menu_name: mainMenu.title,
            permissions: entry.permissions || "",
          });
        }
      }
    }

    return res.status(200).json({
      status: true,
      message: "Sidebar with conditional actions fetched successfully",
      sidebar: Object.values(grouped),
    });

  } catch (error) {
    console.error("Error fetching navigation bar:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};
// ------------for update----------------------
export const GetActionPermissionUpdate = async (req, res) => {
  try {
    const { id } = req.body;
    console.log(req.body)
    const userNavEntries = await UserNavigationBar.find({
      login_id: id,
    })
      .populate("main_menu_id")
      .lean();
    // 3. Group entries by main_menu_id
    const grouped = {};

    userNavEntries.forEach(entry => {
      const mainMenu = entry.main_menu_id;
      if (!mainMenu) return;

      const mainMenuId = mainMenu._id.toString();

      if (!grouped[mainMenuId]) {
        grouped[mainMenuId] = {
          main_menu_id: mainMenuId,
          main_menu_name: mainMenu.title,
          sub_menu_list: [],
        };
      }

      // Try to find the sub_menu name from NavigationBar.items if dropdown
      let subMenuName = "";
      if (entry.sub_menu_id && Array.isArray(mainMenu.items)) {
        const found = mainMenu.items.find(
          item => item._id?.toString() === entry.sub_menu_id || item.title === entry.sub_menu_id
        );
        subMenuName = found ? found.title : entry.sub_menu_id;
      }

      grouped[mainMenuId].sub_menu_list.push({
        sub_menu_id: entry.sub_menu_id || null,
        sub_menu_name: subMenuName || entry.sub_menu_id || "",
        permissions: entry.permissions || "",
      });
    });

    const sidebar = Object.values(grouped);

    return res.status(200).json({
      status: true,
      message: "Sidebar structured data fetched successfully",
      sidebar,
    });

  } catch (error) {
    console.error("Sidebar fetch error:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};
// ----------for list-------------------------
export const GetActionPermissionList = async (req, res) => {
  try {
    const { role } = req.body;

    let masterLogins;
    if (role !== null) {
      masterLogins = await Login.find({ userType: "Master", role_id: role }).select("user_id");
    }
    else {
      masterLogins = await Login.find({
        userType: "Master",
        role_id: { $nin: [role] }
      }).select("user_id");
    }

    console.log(masterLogins)
    const masterLoginIds = masterLogins.map(login => login.user_id.toString()); // convert ObjectId to string

    console.log(masterLoginIds);
    // const userNavbars = await UserNavigationBar.find({ login_id: { $in: masterLoginIds } });
    // console.log(userNavbars)
    const userNavEntries = await UserNavigationBar.find({ login_id: { $in: masterLoginIds } }).populate(
      "main_menu_id"
    );

    return res.status(200).json({
      status: true,
      message: "Sidebar data with permissions fetched successfully",
      sidebar: userNavEntries,
    });
  } catch (error) {
    console.error("Sidebar fetch error:", error);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};
export const UpdateActionPermission = async (req, res) => {
 try {
    const permissionsArray = req.body;
    console.log(permissionsArray,"permissionsArray")
    if (!Array.isArray(permissionsArray)) {
      return res.status(400).json({ success: false, message: 'Request body must be an array.' });
    }

    const results = [];

    for (const item of permissionsArray) {
      const login_id = new mongoose.Types.ObjectId(item.id);
      const main_menu_id = new mongoose.Types.ObjectId(item.mainMenuId);
      const sub_menu_id = item?.subMenuId?.toString?.() || null;

      const existing = await UserNavigationBar.findOne({
        login_id,
        main_menu_id,
        sub_menu_id
      });

      if (existing) {
        existing.permissions = item.permissions;
        await existing.save();
        results.push({
          ...item,
          status: 'updated',
          message: 'Permissions updated successfully.'
        });
      } 
    }

    return res.status(207).json({
      success: true,
      message: 'Permissions processed.',
      results
    });

  } catch (error) {
    console.error('Error saving action permissions:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};
export const deleteActionPermission = async (req, res) => {
  try {
    const {id} = req.params;
    console.log(id,"id")
    const deletedPermission = await UserNavigationBar.findByIdAndDelete({login_id: id});
    if (!deletedPermission) {
      return res.status(404).json({ success: false, message: "action permission  not found" });
    }

    res.status(200).json({ success: true, message: "action permission deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
export const getNavigationBarByUser1 = async (req, res) => {
  try {
    const { role, id } = req.body;
    console.log(id)
    console.log(role)
    let masterLogins;
    if (role !== null) {
      masterLogins = await Login.find({ userType: "Master", role_id: role }).select("user_id");
    }
    else {
      masterLogins = await Login.find({
        userType: "Master",
        role_id: { $nin: [role] }
      }).select("user_id");
    }

    console.log(masterLogins)
    const masterLoginIds = masterLogins.map(login => login.user_id.toString()); // convert ObjectId to string

    console.log(masterLoginIds);
    const userNavEntries = await UserNavigationBar.find({ login_id: { $in: masterLoginIds } }).populate(
      "main_menu_id"
    );
    return res.status(200).json({
      status: true,
      message: "Sidebar data with permissions fetched successfully",
      sidebar: userNavEntries,
    });
  } catch (error) {
    console.error("Sidebar fetch error:", error);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};
export const getNavigationBarByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const userNavEntries = await UserNavigationBar.find({
      user_id: userId,
    }).populate("main_menu_id");

    // Fetch all actions (Add, Edit, etc.)
    const actions = await UserNavigationBar.find();
    const actionMap = new Map();
    actions.forEach((action) => {
      const key = `${action.main_menu_id}_${action.sub_menu_id || "null"}`;
      actionMap.set(key, action.Actions || []);
    });

    // Prepare result array
    const permissions = [];

    for (const entry of userNavEntries) {
      const mainMenu = entry.main_menu_id;
      const subMenuId = entry.sub_menu_id;

      if (!mainMenu || !mainMenu.isActive) continue;

      const mainId = mainMenu._id.toString();
      const subId = subMenuId ? subMenuId.toString() : null;

      // Prepare key for action lookup
      const key = `${mainId}_${subId || "null"}`;
      const permissionList = actionMap.get(key) || [];

      // Add permission entry
      permissions.push({
        main_menu_id: mainId,
        sub_menu_id: subId,
        permissions: permissionList,
      });
    }

    return res.status(200).json({
      status: true,
      message: "Action permissions fetched successfully",
      permissions,
    });
  } catch (error) {
    console.error("Action permission fetch error:", error);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};

export const addAction = async (req, res) => {
  try {
    const { isDropdown, main_menu_id, sub_menu_id, Actions } = req.body;

    // Step 1: Check if action already exists for same main & sub menu
    const existingAction = await Action.findOne({ main_menu_id, sub_menu_id });
    console.log("Existing Action:", existingAction);
    
    if (existingAction) {
      // Step 2: Filter out already existing actions
      const existingActionsSet = new Set(existingAction.Actions);
      const newActions = Actions.filter(action => !existingActionsSet.has(action));

      if (newActions.length === 0) {
        return res.status(200).json({
          success: false,
          message: "Selected already exist for this menu combination.",
        });
      }

      const updated = await Action.findOneAndUpdate(
      { main_menu_id, sub_menu_id },
      { $addToSet: { Actions: { $each: newActions } } },
      { new: true }
      );


      return res.status(200).json({
        success: true,
        message: "New actions added successfully.",
        data: updated,
      });
    }

    // Step 4: If no existing doc, create new one
    const newAction = new Action({
      isDropdown,
      main_menu_id,
      sub_menu_id,
      Actions,
    });

    const savedAction = await newAction.save();

    return res.status(201).json({
      success: true,
      message: "Action created successfully.",
      data: savedAction,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
export const getActionList = async (req, res) => {
  try {
    const actions = await Action.find()
      .populate("main_menu_id")
      .populate("sub_menu_id"); // populate the NavigationBar document
    res.status(200).json({ success: true, data: actions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
export const getActionById = async (req, res) => {
  try {       
    const { id } = req.params;
    const action = await Action.findById(id)
      .populate("main_menu_id")         
      .populate("sub_menu_id"); // populate the NavigationBar document
    if (!action) {  
      return res.status(404).json({ success: false, message: 'Action not found' });
    }
    res.status(200).json({ success: true, data: action });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
export const updateAction = async (req, res) => {
  try {
    
    const { id } = req.params;
    const { isDropdown, main_menu_id, sub_menu_id, Actions } = req.body;

    const updatedAction = await Action.findByIdAndUpdate(
      id,
      {
        isDropdown,
        main_menu_id,
        sub_menu_id,
        Actions
      },
      { new: true }
    );

    if (!updatedAction) {
      return res.status(404).json({ success: false, message: 'Action not found' });
    }

    res.status(200).json({ success: true, data: updatedAction });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
export const deleteAction = async (req, res) => {
  try {       
    const id  = req.params.id;
    console.log(id, "id")
    const deletedAction = await Action.findByIdAndDelete(id);    
    if (!deletedAction) {         
      return res.status(404).json({ success: false, message: 'Action not found' });
    }
    res.status(200).json({ success: true, message: 'Action deleted successfully' });
  } catch (err) {   
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getNavigationBarMenu = async (req, res) => {
  try {
    const menuItems = await NavigationBar.find();

    res.status(200).json({
      status: true,
      message: "NavigationBar menu fetched successfully",
      menuItems,
    });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ status: false, message: "Error fetching sidebar menu" });
  }
};

export const AddNavigationBar = async (req, res) => {
  try {
    console.log(req.body);
    const { existingDropdown, title, icon, path, dropdown, isActive, items } =
      req.body;

    if (existingDropdown) {
      console.log("Adding items to existing dropdown:", existingDropdown);

      // Find the existing menu item
      const existingMenuItem = await SideBar.findOne({
        title: existingDropdown,
      });

      if (!existingMenuItem) {
        return res
          .status(404)
          .json({ status: false, message: "Dropdown menu not found" });
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
    const newMenuItem = await NavigationBar.create({
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

export const updateNavigationBar = async (req, res) => {
  try {
    const menuId = req.params.id;
    const {
      title,
      icon,
      path,
      dropdown,
      isActive,
      items,
      sequence,
      existingDropdown,
    } = req.body;

    console.log("Updating menu with data:", {
      menuId,
      title,
      icon,
      path,
      dropdown,
      isActive,
      existingDropdown,
      itemsCount: items?.length || 0,
    });

    // Log all existing menu IDs before lookup
    const allMenus = await NavigationBar.find({}, "_id title");
    console.log(
      "Available menus in DB:",
      allMenus.map((menu) => ({
        id: menu._id.toString(),
        title: menu.title,
      }))
    );

    // First try to find the menu directly
    let menu = await NavigationBar.findById(menuId);

    // If menu not found directly, it might be a submenu
    if (!menu) {
      console.log("Menu not found directly, checking submenus...");

      // Find all menus that have submenus
      const parentMenus = await NavigationBar.find({ "items._id": menuId });

      if (parentMenus.length > 0) {
        const parentMenu = parentMenus[0];
        console.log("Found parent menu:", {
          id: parentMenu._id,
          title: parentMenu.title,
        });

        // Find the submenu in the parent's items array
        const submenuIndex = parentMenu.items.findIndex(
          (item) => item._id.toString() === menuId
        );

        if (submenuIndex !== -1) {
          // Create updated submenu object with all fields
          const updatedSubmenu = {
            ...parentMenu.items[submenuIndex],
            title: title || parentMenu.items[submenuIndex].title,
            icon: icon || parentMenu.items[submenuIndex].icon,
            path: path || parentMenu.items[submenuIndex].path,
            dropdown: dropdown ?? parentMenu.items[submenuIndex].dropdown,
            isActive: isActive ?? parentMenu.items[submenuIndex].isActive,
            items: items || parentMenu.items[submenuIndex].items,
            sequence: sequence || parentMenu.items[submenuIndex].sequence,
          };

          // If this is a dropdown menu, ensure items array exists
          if (updatedSubmenu.dropdown && !updatedSubmenu.items) {
            updatedSubmenu.items = [];
          }

          // Update the submenu in parent's items array
          parentMenu.items[submenuIndex] = updatedSubmenu;

          // Save the parent menu
          await parentMenu.save();

          console.log("Submenu updated successfully:", {
            parentId: parentMenu._id,
            submenuId: menuId,
            title: updatedSubmenu.title,
            icon: updatedSubmenu.icon,
            path: updatedSubmenu.path,
            dropdown: updatedSubmenu.dropdown,
            isActive: updatedSubmenu.isActive,
            itemsCount: updatedSubmenu.items?.length || 0,
          });

          return res.status(200).json({
            status: true,
            message: "Submenu updated successfully",
            menuItem: updatedSubmenu,
          });
        }
      }

      console.log("Menu not found in parent menus:", menuId);
      return res.status(404).json({
        status: false,
        message: "Menu not found",
      });
    }

    // If we found the menu directly, update it with all fields
    const updatedMenu = {
      ...menu.toObject(),
      title: title || menu.title,
      icon: icon || menu.icon,
      path: path || menu.path,
      dropdown: dropdown ?? menu.dropdown,
      isActive: isActive ?? menu.isActive,
      items: items || menu.items,
      sequence: sequence || menu.sequence,
    };

    // If this is a dropdown menu, ensure items array exists
    if (updatedMenu.dropdown && !updatedMenu.items) {
      updatedMenu.items = [];
    }

    // Update the menu
    Object.assign(menu, updatedMenu);
    await menu.save();

    console.log("Menu updated successfully:", {
      id: menu._id,
      title: menu.title,
      icon: menu.icon,
      path: menu.path,
      dropdown: menu.dropdown,
      isActive: menu.isActive,
      itemsCount: menu.items?.length || 0,
    });

    return res.status(200).json({
      status: true,
      message: "Menu updated successfully",
      menuItem: menu,
    });
  } catch (error) {
    console.error("Error updating menu:", error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};
export const deleteNavigationBar = async (req, res) => {
  try {
    const menuId = req.params.id;

    if (!menuId) {
      return res
        .status(400)
        .json({ status: false, message: "Menu ID is required" });
    }

    const existingMenu = await NavigationBar.findById(menuId);

    if (!existingMenu) {
      return res.status(404).json({ status: false, message: "Menu not found" });
    }

    // If it's a dropdown menu, also remove any references to its submenu items
    if (existingMenu.dropdown && existingMenu.items.length > 0) {
      // Remove any user navigation bar entries that reference this menu or its submenus
      await UserNavigationBar.deleteMany({
        $or: [
          { main_menu_id: menuId },
          { sub_menu_id: { $in: existingMenu.items.map((item) => item._id) } },
        ],
      });
    }

    // Delete the menu
    await NavigationBar.findByIdAndDelete(menuId);

    return res.status(200).json({
      status: true,
      message: "Menu deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteNavigationBar:", error.message);
    return res.status(500).json({ status: false, message: error.message });
  }
};

export const getNavigationBarById = async (req, res) => {
  try {
    const menuId = req.params.id;
    console.log("Getting menu by ID:", menuId);

    const menu = await NavigationBar.findById(menuId);
    if (!menu) {
      console.log("Menu not found:", menuId);
      return res.status(404).json({
        status: false,
        message: "Menu not found",
      });
    }

    console.log("Found menu:", {
      id: menu._id,
      title: menu.title,
      isActive: menu.isActive,
    });

    return res.status(200).json({
      status: true,
      message: "Menu found",
      menu,
    });
  } catch (error) {
    console.error("Error getting menu:", error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export const UpdateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, description, isActive } = req.body;

    // Check if role exists
    const existingRole = await Roles.findById(id);
    if (!existingRole) {
      return res.status(404).json({
        status: false,
        message: "Role not found",
      });
    }

    // Check if another role with the same name exists
    const duplicateRole = await Roles.findOne({
      role: role,
      _id: { $ne: id }, // Exclude current role from check
    });
    if (duplicateRole) {
      return res.status(400).json({
        status: false,
        message: "A role with this name already exists",
      });
    }

    // Update role
    const updatedRole = await Roles.findByIdAndUpdate(
      id,
      { role, description, isActive },
      { new: true }
    );

    res.status(200).json({
      status: true,
      message: "Role updated successfully",
      data: updatedRole,
    });
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const GetRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Roles.findById(id);
    if (!role) {
      return res.status(404).json({
        status: false,
        message: "Role not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Role fetched successfully",
      data: role,
    });
  } catch (error) {
    console.error("Error fetching role:", error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
export const deleteRole = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedRole = await Roles.findByIdAndDelete(id);
    if (!deletedRole) {
      return res.status(404).json({ success: false, message: "roles  not found" });
    }

    res.status(200).json({ success: true, message: "roles deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
// export const getNavigationBarById = async (req, res) => {
//   try {
//     const menuId = req.params.id;
//     console.log('Getting menu by ID:', menuId);

//     const menu = await NavigationBar.findById(menuId);
//     if (!menu) {
//       console.log('Menu not found:', menuId);
//       return res.status(404).json({
//         status: false,
//         message: "Menu not found"
//       });
//     }

//     console.log('Found menu:', {
//       id: menu._id,
//       title: menu.title,
//       isActive: menu.isActive
//     });

//     return res.status(200).json({
//       status: true,
//       message: "Menu found",
//       menu
//     });
//   } catch (error) {
//     console.error("Error getting menu:", error);
//     return res.status(500).json({
//       status: false,
//       message: error.message
//     });
//   }
// };
export const AddActionPermission = async (req, res) => {
  try {
    const permissionsArray = req.body;

    if (!Array.isArray(permissionsArray)) {
      return res.status(400).json({ success: false, message: 'Request body must be an array.' });
    }

    const results = [];

    for (const item of permissionsArray) {
      const login_id = new mongoose.Types.ObjectId(item.id);
      const main_menu_id = new mongoose.Types.ObjectId(item.mainMenuId);
      const sub_menu_id = item?.subMenuId?.toString?.() || null;

      const existing = await UserNavigationBar.findOne({
        login_id,
        main_menu_id,
        sub_menu_id
      });

      if (existing) {
        existing.permissions = item.permissions;
        await existing.save();
        results.push({
          ...item,
          status: 'updated',
          message: 'Permissions updated successfully.'
        });
      } else {
        const newPermission = new UserNavigationBar({
          login_id,
          main_menu_id,
          sub_menu_id,
          isDropdown: !!sub_menu_id,
          permissions: item.permissions,
          createdBy: null,
        });

        await newPermission.save();

        results.push({
          ...item,
          status: 'created',
          message: 'Permission added successfully.'
        });
      }
    }

    return res.status(207).json({
      success: true,
      message: 'Permissions processed.',
      results
    });

  } catch (error) {
    console.error('Error saving action permissions:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
};




