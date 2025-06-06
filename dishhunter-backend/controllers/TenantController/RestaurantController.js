import { getTenantRestaurantModels } from "../../models/TenantTables/Restaurants.js";
export const getMenuList = async (req, res) => {
  try {
    // const conn = await getTenantConnection(dbName); // Lazy-loaded, cached
    const { Menus } = getTenantRestaurantModels(req.tenantConnection);
    
    const menuList = await Menus.find();

    res.status(200).json({
      status: true,
      message: 'Restaurant menu fetched successfully!',
      data: menuList,
    });
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
};

export const createMember = async (req, res) => {
  try {
    console.log('req.tenantConnection',req.tenantConnection);
    
    const { Members } = getTenantRestaurantModels(req.tenantConnection);
    
    console.log('members',Members);
    

    const existingMember = await Members.findOne({ email: req.body.email });
    if (existingMember) {
      return res.status(400).json({
        status: false,
        message: "Member with this email already exists.",
      });
    }

    const newMember = new Members(req.body);
    await newMember.save();

    res.status(201).json({
      status: true,
      message: "Member created successfully!",
      data: newMember,
    });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
};


export const getAllMembers = async (req, res) => {
  try {
    const { Members } = getTenantRestaurantModels(req.tenantConnection);

    const memberList = await Members.find()
      .populate("role_id")
      .populate("restaurent_id");

    res.status(200).json({
      status: true,
      message: "All members fetched successfully!",
      data: memberList,
    });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
};

export const updateMember = async (req, res) => {
  try {
    const { Members } = getTenantRestaurantModels(req.tenantConnection);

    const updatedMember = await Members.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: true,
      message: "Member updated successfully!",
      data: updatedMember,
    });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
};

export const deleteMember = async (req, res) => {
  try {
    const { Members } = getTenantRestaurantModels(req.tenantConnection);

    await Members.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: true,
      message: "Member deleted successfully!",
    });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
};
