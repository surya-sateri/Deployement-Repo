import { createJWT } from "../utils/index.js";
import Client from "../models/client.js";
export const registerClient = async (req, res) => {
  try {
    const { name, email, primaryphone,secondaryphone,country,state,district,taluka,address,pincode,bankname,accountnumber,ifsccode,branchname,adharnumber,pannumber, password, restaurent_id, role  } = req.body;
    console.log(req.body)
    const clientExist = await Client.findOne({ email });

    if (clientExist) {
      return res.status(400).json({
        status: false,
        message: "Client already exists",
      });
    }

    const client = await Client.create({
      name, email, primaryphone,secondaryphone,country,state,district,taluka,address,pincode,bankname,accountnumber,ifsccode,branchname,adharnumber,pannumber, password, restaurent_id, role 
    });

    if (client) {
      const token = createJWT(res, client);
      client.password = undefined; // Ensure password is not sent in the response
      res.status(201).json({
        status: true,
        message: "Client registered successfully",
        client, // Send the client details
        token, // Send the generated token
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
      const ClientList = await Client.find().select("name email isAdmin isActive");
      // const ClientList = [
      //   {
      //       'id':1,
      //       'name':"ketan",
      //       'email':"kp@gmail.com",
      //       'industry':"it",
      //   },
      //   {
      //       'id':2,
      //       'name':"kartik",
      //       'email':"kartik@gmail.com",
      //       'industry':"it",
      //   }
      // ]
      // Add any additional logic for client registration if needed
  
      // Send success response
    //   return res.status(200).json({ status: true, message: "Client registered successfully" });
      return res.status(200).json(ClientList);
    } catch (error) {
      console.log(error);
      return res.status(400).json({ status: false, message: error.message });
    }
  };

export const updateClientDetails = async (req, res) => {
  try {
    const clientId = req.params.id;
    const updatedData =  req.body ;
    console.log(updatedData)
    // If password is present, hash it
    // if (updatedData.password) {
    //   const salt = await bcrypt.genSalt(10);
    //   updatedData.password = await bcrypt.hash(updatedData.password, salt);
    // }

    const updatedClient = await Client.findByIdAndUpdate(
      clientId,
      updatedData,
      { new: true }
    );
    console.log(updatedClient)

    if (!updatedClient) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json(updatedData);
  } catch (error) {
    console.error("Error updating client:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getClientDetailsById = async (req, res) => {
  try {
    const clientId = req.params.id;

    // Check if the ID is a valid MongoDB ObjectId
    if (!clientId || clientId.length !== 24) {
      return res.status(400).json({ message: "Invalid client ID format" });
    }

    const client = await Client.findById(clientId).populate("restaurent_id");

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json(client);
  } catch (error) {
    console.error("Error fetching client details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const changeClientIsActiveStatus = async (req, res) => {
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

    const updatedClient = await Client.findByIdAndUpdate(
      id,
      { isActive: status === 'Active' },
      { new: true }
    );

    if (!updatedClient) {
      return res.status(404).json({
        success: false,
        message: 'Client not found.',
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
      message: 'Something went wrong while updating client status.',
      error: error.message,
    });
  }
};
