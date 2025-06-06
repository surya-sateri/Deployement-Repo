import Customer from "../models/customer.js";
// ===============================
// GET ALL CUSTOMERS
// ===============================
export const getCustomerList = async (req, res) => {
  try {
    const customers = await Customer.find()
      .populate("restaurent_id", "name") // populate restaurant name
      .populate("role_id", "name"); // populate role name

    res.status(200).json({
      status: true,
      message: "Customer list fetched successfully",
      data: customers,
    });
  } catch (error) {
    console.error("Error fetching customers:", error.message);
    res.status(500).json({ status: false, message: error.message });
  }
};

// ===============================
// ADD NEW CUSTOMER
// ===============================
export const addCustomer = async (req, res) => {
  try {
    const {
      name,
      restaurent_id,
      email,
      primaryphone,
      secondaryphone,
      country,
      state,
      district,
      taluka,
      address,
      pincode,
      adharnumber,
      pannumber,
      password,
      role_id,
    } = req.body;

    const existing = await Customer.findOne({ email });
    if (existing) {
      return res.status(400).json({ status: false, message: "Email already exists" });
    }

    const customer = new Customer({
      name,
      restaurent_id,
      email,
      primaryphone,
      secondaryphone,
      country,
      state,
      district,
      taluka,
      address,
      pincode,
      adharnumber,
      pannumber,
      password,
      role_id,
    });

    await customer.save();

    res.status(201).json({
      status: true,
      message: "Customer added successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Error adding customer:", error.message);
    res.status(500).json({ status: false, message: error.message });
  }
};

// ===============================
// UPDATE CUSTOMER
// ===============================
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const existingCustomer = await Customer.findById(id);
    if (!existingCustomer) {
      return res.status(404).json({ status: false, message: "Customer not found" });
    }

    const {
      name,
      restaurent_id,
      email,
      primaryphone,
      secondaryphone,
      country,
      state,
      district,
      taluka,
      address,
      pincode,
      adharnumber,
      pannumber,
      password,
      role_id,
      isActive
    } = req.body;

    // update only provided fields
    if (name) existingCustomer.name = name;
    if (restaurent_id) existingCustomer.restaurent_id = restaurent_id;
    if (email) existingCustomer.email = email;
    if (primaryphone) existingCustomer.primaryphone = primaryphone;
    if (secondaryphone) existingCustomer.secondaryphone = secondaryphone;
    if (country) existingCustomer.country = country;
    if (state) existingCustomer.state = state;
    if (district) existingCustomer.district = district;
    if (taluka) existingCustomer.taluka = taluka;
    if (address) existingCustomer.address = address;
    if (pincode) existingCustomer.pincode = pincode;
    if (adharnumber) existingCustomer.adharnumber = adharnumber;
    if (pannumber) existingCustomer.pannumber = pannumber;
    if (typeof isActive === "boolean") existingCustomer.isActive = isActive;
    if (role_id) existingCustomer.role_id = role_id;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      existingCustomer.password = await bcrypt.hash(password, salt);
    }

    await existingCustomer.save();

    res.status(200).json({
      status: true,
      message: "Customer updated successfully",
      data: existingCustomer,
    });
  } catch (error) {
    console.error("Error updating customer:", error.message);
    res.status(500).json({ status: false, message: error.message });
  }
};
export const changeCustomerIsActiveStatus = async (req, res) => {
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

    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      { isActive: status === 'Active' },
      { new: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Customer status updated to ${status}.`,
      data: updatedCustomer,
    });
  } catch (error) {
    console.error('Error updating customer status:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while updating customer status.',
      error: error.message,
    });
  }
};