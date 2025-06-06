import {Restaurent, Bookings, CouponData, CouponMetaData,Menu,Counter, ReviewsRatings,RestaurantGallery} from "../models/restaurent.js";
import crypto from "crypto";
import moment from "moment";
import fs from 'fs/promises';
import path from 'path';
import mongoose from 'mongoose';

export const registerRestaurent = async (req, res) => {
  try {
    const { name, email, address, isActive, type,district,taluka, state, pincode,primaryphone,secondaryphone,country,closeTime,openTime,establishDate } = req.body;
    console.log(req.body)
    const restautentExist = await Restaurent.findOne({ email });

    if (restautentExist) {
      return res.status(400).json({
        status: false,
        message: "Restaurent already exists",
      });
    }

    const restaurant = await Restaurent.create({
        name, email, address, isActive, district,type,taluka, state, pincode,primaryphone,secondaryphone,country,closeTime,openTime,establishDate
    });

    if (restaurant) {
      res.status(201).json({
        status: true,
        message: "Restaurent registered successfully",
      });
    } else {
      return res
        .status(400)
        .json({ status: false, message: "Invalid restaurent data" });
    }    
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
}
export const updateBookingDetails = async (req, res) => {
  try {
    const { id } = req.params; // Get booking ID from request params
    const { name, email, no_of_people, coupon_code, primaryphone, date_time,isActive } = req.body; // Include date_time

    // Check if the booking exists
    console.log(req.params);
    console.log(req.body);
    const booking = await Bookings.findById(id);
    if (!booking) {
      return res.status(404).json({ status: false, message: "Booking not found" });
    }

    let couponData = null;

    // If coupon_code is provided, check if it's valid
    if (coupon_code) {
      couponData = await CouponData.findOne({ code: coupon_code });

      if (!couponData) {
        const couponMeta = await CouponMetaData.findOne({ discount: 10 }); // Fetch metadata if applicable
        if (!couponMeta) {
          return res.status(400).json({ status: false, message: "Invalid coupon code or metadata missing" });
        }

        // Generate new coupon if not found
        const generatedCouponCode = `COUPON-${Date.now()}`;
        couponData = await CouponData.create({
          couponMetaData: couponMeta._id,
          code: generatedCouponCode,
          discount: couponMeta.discount,
          expiry_date: moment().add(7, "days").toDate(),
          min_purchase: couponMeta.min_purchase,
          max_discount: couponMeta.max_discount,
          usage_limit: couponMeta.usage_limit,
          used_count: couponMeta.used_count,
          isActive: true,
        });
      }
    }

    // Update booking details
    booking.name = name || booking.name;
    booking.email = email || booking.email;
    booking.no_of_people = no_of_people || booking.no_of_people;
    booking.primaryphone = primaryphone || booking.primaryphone;
    booking.coupon_code = couponData ? couponData._id : booking.coupon_code; // Update coupon if changed
    booking.date_time = date_time || booking.date_time; // <-- Added this line
    // booking.isActive = isActive || booking.isActive; // <-- Added this line
    if (typeof isActive === "boolean") {
      booking.isActive = isActive;
    }
    await booking.save(); // Save the updated booking

    return res.status(200).json({
      status: true,
      message: "Booking details updated successfully",
      booking,
      coupon: couponData || "No new coupon applied",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

//add booking controller with corrections

export const addBookings = async (req, res) => {
  try {

    const {
      restaurent_id,
      name,
      email,
      no_of_people,
      coupon_code,
      date_time,
      address,
      city,
      state,
      pincode,
      primaryphone,
      country,
      isActive = true,
      booking_type,
    } = req.body;

    // Log request body for debugging
    console.log('Request body:', req.body);

    // Validate required fields
    if (!restaurent_id || !name || !email || !no_of_people || !primaryphone || !date_time) {
      return res.status(400).json({
        status: false,
        message: 'Missing required fields: restaurent_id, name, email, no_of_people, primaryphone, date_time',
      });
    }

    const bookingDate = new Date(date_time);
    if (isNaN(bookingDate.getTime())) {
      return res.status(400).json({
        status: false,
        message: 'Invalid date_time format',
      });
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid email format',
      });
    }

    // Validate no_of_people
    if (!Number.isInteger(Number(no_of_people)) || no_of_people < 1) {
      return res.status(400).json({
        status: false,
        message: 'Number of people must be a positive integer',
      });
    }

    // Check if booking exists for today with the same primaryphone
    const startOfDay = moment().startOf('day').toDate();
    const endOfDay = moment().endOf('day').toDate();
    const bookingExist = await Bookings.findOne({
      primaryphone: Number(primaryphone),
      date_time: { $gte: startOfDay, $lte: endOfDay },
    });

    if (bookingExist) {
      return res.status(400).json({
        status: false,
        message: 'Booking already exists for today',
      });
    }

    let couponData = null;
    if (coupon_code) {
      couponData = await CouponData.findOne({ code: coupon_code, isActive: true });
      if (!couponData) {
        return res.status(400).json({
          status: false,
          message: 'Invalid or inactive coupon code',
        });
      }
    } else {
      const couponMeta = await CouponMetaData.findOne({ discount: 10 });
      if (!couponMeta) {
        return res.status(400).json({
          status: false,
          message: 'No valid coupon metadata found',
        });
      }

      const generatedCouponCode = `COUPON-${Date.now()}`;
      couponData = await CouponData.create({
        couponMetaData: couponMeta._id,
        code: generatedCouponCode,
        discount: couponMeta.discount,
        expiry_date: moment().add(7, 'days').toDate(),
        min_purchase: couponMeta.min_purchase,
        max_discount: couponMeta.max_discount,
        usage_limit: couponMeta.usage_limit,
        used_count: couponMeta.used_count,
        isActive: true,
      });
    }

    // Create booking
    const booking = new Bookings({
      restaurent_id,
      name,
      email,
      no_of_people: Number(no_of_people),
      coupon_code: couponData ? couponData._id : null,
      date_time: bookingDate,
      primaryphone: Number(primaryphone),
      country: country || '',
      state: state || '',
      city: city || '',
      address: address || '',
      pincode: pincode ? Number(pincode) : null,
      status: '',
      isActive,
      booking_type: booking_type || 'Dinner', // Default to 'Dinner'
    });

    await booking.save();
    res.status(201).json({
      status: true,
      message: 'Booking created successfully',
      data: booking,
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};

export const getBookingList = async (req, res) => {
  try {
    console.log('getBookingList controller hit:', req.url);
    console.log('User ID from request:', req.user._id);
    console.log('Database connection:', mongoose.connection.name);
    console.log('Bookings model:', Bookings.modelName);
    
    // First verify if the restaurant exists
    const restaurant = await Restaurent.findById(req.user._id);
    console.log('Restaurant found:', {
      found: !!restaurant,
      name: restaurant?.name,
      email: restaurant?.email
    });

    if (!restaurant) {
      console.log('Restaurant not found with ID:', req.user._id);
      return res.status(404).json({ 
        status: false, 
        message: "Restaurant not found. Please verify your account." 
      });
    }
    
    // Log the query parameters
    console.log('Query parameters:', {
      restaurent_id: req.user._id,
      isActive: true
    });

    // Try both field names since we're not sure which model is being used
    const bookings = await Bookings.find({
      $or: [
        { restaurent_id: req.user._id },
        { restaurant_id: req.user._id }
      ],
      isActive: true
    }).populate("customerId", "name email phone");

    console.log('Database query result:', {
      foundBookings: bookings.length,
      bookings: bookings.map((b) => ({
        id: b._id,
        restaurent_id: b.restaurent_id,
        restaurant_id: b.restaurant_id,
        name: b.name,
        email: b.email
      }))
    });

    if (!bookings.length) {
      console.log('No bookings found for restaurent_id:', req.user._id);
      return res.status(200).json({ 
        status: true, 
        message: "No bookings found.",
        bookings: []
      });
    }

    console.log('Successfully retrieved bookings');
    return res.status(200).json({
      status: true,
      message: "Bookings retrieved successfully",
      bookings,
    });
  } catch (error) {
    console.error('Error in getBookingList:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return res.status(500).json({
      status: false,
      message: "Error retrieving bookings",
      error: error.message
    });
  }
};
export const changeBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status,user } = req.body;

    const allowedStatuses = ["New", "Pending", "Accepted", "Rejected", "Completed"];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        status: false,
        message: `Invalid status. Allowed values are: ${allowedStatuses.join(", ")}.`
      });
    }

    const updateData = { status };
    // If status is "Pending", also store who accepted it
    if (status === "Accepted") {
      if (!user || !user._id) {
        return res.status(401).json({
          status: false,
          message: "Unauthorized: User not found in request."
        });
      }
      updateData.acceptedBy = user._id;
    }
    const updatedBooking = await Bookings.findByIdAndUpdate(
      bookingId,
      updateData,
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({
        status: false,
        message: "Booking not found."
      });
    }

    return res.status(200).json({
      status: true,
      message: "Booking status updated successfully.",
      booking: updatedBooking
    });

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Something went wrong.",
      error: error.message
    });
  }
};

// export const addRestaurentMenu = async (req, res) => {
//   try {
//     const {
//       restaurent_id,
//       itemName,
//       price,
//       category,
//       cuisineType,
//       description,
//       tags,
//       videoUrl,
//       availability,
//       status
//     } = req.body;

//     // Create new menu item
//     const newMenu = new Menu({
//       restaurent_id,
//       itemName,
//       price,
//       category,
//       cuisineType,
//       description,
//       tags,
//       videoUrl,
//       availability: availability === 'true' || availability === true,
//       status: status === 'true' || status === true,
//     });

//     // Save to DB
//     const savedMenu = await newMenu.save();

//     return res.status(201).json({
//       message: 'Menu item added successfully',
//       menu: savedMenu
//     });

//   } catch (error) {
//     if (error.code === 11000) {
//       return res.status(400).json({ message: 'Item name must be unique' });
//     }
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// };

export const addRestaurentMenu = async (req, res) => {
  try {
    const {
      restaurent_id,
      itemName,
      price,
      menucode,
      category,
      cuisineType,
      description,
      tags,
      videoUrl,
      availability,
      status,
      allergens,
      spicyness,
      calories,
      variants,
      dishCustomization,
      nutritions,
      sortingFilters
    } = req.body;

    // Create new menu item
    const newMenu = new Menu({
      restaurent_id,
      itemName,
      price,
      menucode,
      category,
      cuisineType,
      description,
      tags,
      videoUrl,
      availability: availability === 'true' || availability === true,
      status: status === 'true' || status === true,
      allergens,
      spicyness,
      calories,
      variants,
      dishCustomization,
      nutritions,
    });

    // Save to DB
    const savedMenu = await newMenu.save();

    return res.status(201).json({
      message: 'Menu item added successfully',
      menu: savedMenu
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Item name must be unique' });
    }
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const updateMenu = async (req, res) => {
  try {
    const { id } = req.params; // menu item ID from URL
    const {
      itemName,
      price,
      menucode,
      category,
      cuisineType,
      description,
      tags,
      videoUrl,
      availability,
      status
    } = req.body;
 
    // Build update object
    const updatedFields = {
      ...(itemName && { itemName }),
      ...(price && { price }),
      ...(menucode && { menucode }),
      ...(category && { category }),
      ...(cuisineType && { cuisineType }),
      ...(description && { description }),
      ...(tags && { tags }),
      ...(videoUrl && { videoUrl }),
      ...(availability !== undefined && { availability: availability === 'true' || availability === true }),
      ...(status !== undefined && { status: status === 'true' || status === true }),
    };

    // Update the menu item
    const updatedMenu = await Menu.findByIdAndUpdate(id, updatedFields, {
      new: true, // return the updated document
      runValidators: true, // enforce schema validations
    });

    if (!updatedMenu) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    return res.status(200).json({
      message: 'Menu item updated successfully',
      menu: updatedMenu
    });

  } catch (error) {
    console.error('Error updating menu:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Item name must be unique' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getRestaurentList = async (req, res) => {
  try {
    const restaurents = await Restaurent.find().select(
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
            'uploads',
            'restaurent',
            galleryImage.newName
          );

          try {
            const imageBuffer = await fs.readFile(imagePath);
            const base64 = imageBuffer.toString('base64');
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
export const updateBookingDetails1 = async (req, res) =>{
  try{
    console.log(req.params);
    console.log(req.body);
    const {id} = req.params;
    const {name, email, no_of_people, date_time, primaryphone, isActive} = req.body;
    const bookingDetails = await Bookings.findById(id)
    bookingDetails.restaurent_id='67b09a1ccc62324a517d78e4';
    bookingDetails.name = name;
    bookingDetails.email = email;
    bookingDetails.no_of_people = no_of_people;
    bookingDetails.date_time = date_time;
    bookingDetails.primaryphone = primaryphone;
    bookingDetails.isActive = isActive;
    await bookingDetails.save()

    return res.status(200).json({ status: true, message:'Booking details data updated successfully!'});
  }
  catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
}
export const generateCouponCode = async (req, res) => {
  try {
    // Generate a random alphanumeric coupon code
    const couponCode = crypto.randomBytes(4).toString("hex").toUpperCase();

    return res.status(200).json({
      status: true,
      couponCode: couponCode,
      message: "Coupon code generated successfully."
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
}
// export const getCouponMetaData = async (req, res)=>{
//   try {
//     const couponMetaDataList = await CouponMetaData.find().select("discount expiry_date min_purchase max_discount usage_limit used_count isActive")
//     return res.status(200).json(couponMetaDataList);
//   } catch (error) {
//     console.log(error);
//     return res.status(400).json({ status: false, message: error.message });
//   }
// }
// export const addCouponMetaData = async (req, res) => {
//   try {
//     console.log(req.body)
//     const { restaurent_id, discount, expiry_date, min_purchase, max_discount, usage_limit, used_count, isActive } = req.body;

//     // Get the next sequence number
//     let counter = await Counter.findOneAndUpdate(
//       { name: "coupon_id" },
//       { $inc: { seq: 1 } },
//       { new: true, upsert: true }
//     );
//     console.log(counter.seq)
//     const data = await CouponMetaData.create({
//       id:11,
//       restaurent_id,
//       discount,
//       expiry_date:'2025-03-03',
//       min_purchase,
//       max_discount,
//       usage_limit,
//       used_count,
//       isActive,
//     });

//     res.status(201).json({
//       status: true,
//       message: "Coupon meta data added successfully",
//       data,
//     });
//   } catch (error) {
//     console.log(error.message)
//     return res.status(400).json({ status: false, message: error.message });
//   }
// }
// export const updateCouponMetaDataById = async (req, res) =>{
//   try{
//     console.log(req.params)
//     console.log(req.body)
//     const {id} = req.params;
//     const {discount, expiry_date, min_purchase, max_discount, usage_limit, used_count, isActive} = req.body;
//     const couponMetaData = await CouponMetaData.findById(id)
//     couponMetaData.restaurent_id='67b09a1ccc62324a517d78e4';
//     couponMetaData.discount = discount;
//     couponMetaData.expiry_date = expiry_date;
//     couponMetaData.min_purchase = min_purchase;
//     couponMetaData.max_discount = max_discount;
//     couponMetaData.usage_limit = usage_limit;
//     couponMetaData.used_count = used_count;
//     couponMetaData.isActive = isActive;
//     await couponMetaData.save()

//     return res.status(200).json({ status: true, message:'Coupon meta data updated successfully!'});
//   }
//   catch(error){
//     return res.status(400).json({ status: false, message: error.message });
//   }
// }
export const getMenuByRestaurantId = async (req, res) =>{
  try{
    const {id} = req.params;
    const restaurantMenuList = await Menu.find({ restaurent_id:id });
    res.status(200).json({status: true, message:'Restaurant menu fetched successfully!', restaurantMenuList});
  }
  catch(error){
    return res.status(400).json({ status: false, message: error.message });
  }
}
export const getAllReviews = async (req, res) =>{
    try {
      const allReviews = await ReviewsRatings.find().select("restaurent_id name rating review isActive")
      res.status(200).json(allReviews);
    } catch (error) {
      console.log(error);
      return res.status(400).json({ status: false, message: error.message });
    }
  }
export const addReview = async (req, res)=>{
 try{
  const {name,rating,review,isActive } = req.body;
  const newreview =ReviewsRatings.create({restaurent_id:'67b09a1ccc62324a517d78e4',name,rating,review,isActive});
  if (newreview){
    res.status(201).json({
      status: true,
      message: "Review added successfully",
    });
  
  }
  else{
    return res.status(400).json({ status: false, message: "An issue occurred while adding review. Please try again. " });
  }
  
 } catch(error){
  return res.status(400).json({ status: false, message: error.message });
 }
}
export const updateReview = async (req, res) =>{
  try{
    const {id} = req.params;
    const {name,rating,review,isActive } = req.body;
    const reviewData = await ReviewsRatings.findById(id);
    reviewData.restaurent_id='67b09a1ccc62324a517d78e4';
    reviewData.name = name;
    reviewData.rating = rating;
    reviewData.review = review;
    reviewData.isActive = isActive;
    await reviewData.save();

    return res.status(200).json({ status: true, message:'Review data updated successfully!'});
  }
  catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
}
export const getReviewById = async (req, res) =>{
  try {
    const {id} = req.params;
    const reviewData = await ReviewsRatings.findById(id).select("name rating review isActive");
    res.status(200).json(reviewData);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
}
export const getCouponList = async (req, res) =>{
  try {
    const couponList = await CouponData.find().select("booking_id couponMetaData code discount expiry_date min_purchase  max_discount  usage_limit used_count isActive");
    res.status(200).json(couponList);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
}
export const addCoupon = async (req, res) => {
  try {
    const { booking_id, couponMetaData, code, discount, expiry_date, min_purchase, max_discount, usage_limit, used_count, isActive } = req.body;

    const data = await CouponData.create({
      booking_id,
      couponMetaData,
      code,
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
      message: "Coupon data added successfully",
      data,
    });
  } catch (error) {
    console.log(error.message)
    return res.status(400).json({ status: false, message: error.message });
  }
}
export const getReviewByRestaurantId = async (req, res) =>{
  try {
    const {restaurent_id} = req.params;
    const reviewData = await ReviewsRatings.find(restaurent_id);
    res.status(200).json(reviewData);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
}
export const getRestaurantById = async (req, res) =>{
  try {
    const {id} = req.params;
    const restaurantData = await Restaurent.findById(id).select("name email type primaryphone secondaryphone country state city address pincode isActive");
    res.status(200).json(restaurantData);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
}
export const updateRestaurantById = async (req, res) =>{
  try{
    const {id} = req.params;
    const { name, email, address, isActive, type,district,taluka, state, pincode,primaryphone,secondaryphone,country,closeTime,openTime,establishDate } = req.body;

    const restaurantExist = await Restaurent.findOne({ email },{new: true});

    // if (restaurantExist) {
    //   return res.status(400).json({
    //     status: false,
    //     message: "Restaurant already exists",
    //   });
    // }

    const restaurantData = await Restaurent.findById(id);
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

    return res.status(200).json({ status: true, message:'Restaurant data updated successfully!'});
  }
  catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, message: error.message });
  }
}

export const addRestarantDetails = async (req, res) => {
  try {
    const { name,filename, email, address, isActive, type,district,taluka, state, pincode,primaryphone,secondaryphone,country,closeTime,openTime,establishDate } = req.body;
    console.log(req.body)
    if (!req.file) {
      return res.status(400).json({
        status: false,
        message: "No file uploaded",
      });
    }
    const restautentExist = await Restaurent.findOne({ email });
    if (restautentExist) {
      return res.status(400).json({
        status: false,
        message: "Restaurent already exists",
      });
    }
    const restaurant = await Restaurent.create({
        name, email, address, isActive, district,type,taluka, state, pincode,primaryphone,secondaryphone,country,closeTime,openTime,establishDate
    });
    const originalName = req.file.originalname;
    const tempPath = req.file.path;
    const newFilename = `${name}_${filename}`;
    const destinationDir = path.resolve('uploads/restaurent');
    const finalPath = path.join(destinationDir, newFilename);
    const fileExtension = path.extname(originalName).slice(1);
    const restaurent_id = restaurant._id;
    await fs.mkdir(destinationDir, { recursive: true });

    await fs.rename(tempPath, finalPath);

    const documentUrl = finalPath;
    const restGallery = await RestaurantGallery.create({
      restaurent_id,
      path: finalPath,
      isActive: true,
      ext: fileExtension,
      originalName: originalName,
      newName:newFilename ,
      isVideo: false,
      isImage: true,
      
    })
    return res.status(200).json({
      status: true,
      message: "Document uploaded successfully",
      filePath: documentUrl,
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
export const changeRestarauntIsActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ["Active", "Inactive"];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        status: false,
        message: `Invalid status. Allowed values are: ${allowedStatuses.join(", ")}.`
      });
    }

    const updateData = { isActive: status === "Active" };

    const updatedRestaurent = await Restaurent.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedRestaurent) {
      return res.status(404).json({
        status: false,
        message: "Restaurent not found."
      });
    }

    return res.status(200).json({
      status: true,
      message: `Restaurent is now ${status}.`,
      data: updatedRestaurent
    });

  } catch (error) {
    console.error("Error updating restaurent status:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong.",
      error: error.message
    });
  }
};
export const changeBookingIsActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ["Active", "Inactive"];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        status: false,
        message: `Invalid status. Allowed values are: ${allowedStatuses.join(", ")}.`
      });
    }

    const updateData = { isActive: status === "Active" };

    const updatedRestaurent = await Bookings.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedRestaurent) {
      return res.status(404).json({
        status: false,
        message: "Restaurent not found."
      });
    }

    return res.status(200).json({
      status: true,
      message: `Restaurent is now ${status}.`,
      data: updatedRestaurent
    });

  } catch (error) {
    console.error("Error updating restaurent status:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong.",
      error: error.message
    });
  }
};
export const changeRestaurantMenuIsActiveStatus = async (req, res) => {
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

    const updateData = { isActive: status === 'Active' };

    const updatedMenu = await Menu.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedMenu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Menu is now ${status}.`,
      data: updatedMenu,
    });

  } catch (error) {
    console.error('Error updating menu status:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while updating menu status.',
      error: error.message,
    });
  }
};

export const changeReviewIsActiveStatus = async (req, res) => {
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

    const updatedReview = await ReviewsRatings.findByIdAndUpdate(
      id,
      { isActive: status === 'Active' },
      { new: true }
    );

    if (!updatedReview) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Review status updated to ${status}.`,
      data: updatedReview,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while updating review status.',
      error: error.message,
    });
  }
};
// export const changeCouponMetaDataIsActiveStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     const allowedStatuses = ['Active', 'Inactive'];
//     if (!status || !allowedStatuses.includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: `Invalid status. Allowed values are: ${allowedStatuses.join(', ')}.`,
//       });
//     }

//     const updatedCouponMetaData = await CouponMetaData.findByIdAndUpdate(
//       id,
//       { isActive: status === 'Active' },
//       { new: true }
//     );

//     if (!updatedCouponMetaData) {
//       return res.status(404).json({
//         success: false,
//         message: 'Coupon metadata not found.',
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: `Coupon metadata status updated to ${status}.`,
//       data: updatedCouponMetaData,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: 'Something went wrong while updating coupon metadata status.',
//       error: error.message,
//     });
//   }
// };
export const getAllReviewsByID = async (req, res) =>{
    try {
      const {id} = req.params;
      const allReviews = await ReviewsRatings.find({restaurent_id:id}).select("restaurent_id name rating review isActive")
      res.status(200).json(allReviews);
    } catch (error) {
      console.log(error);
      return res.status(400).json({ status: false, message: error.message });
    }
  }

  export const getNearbyRestaurants = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const nearbyRestaurants = await RestaurentModel.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)], // MongoDB requires [lng, lat]
          },
          distanceField: 'distance',
          spherical: true,
          maxDistance: 5000, // 5 km
        },
      },
      { $limit: 20 },
    ]);

    res.status(200).json(nearbyRestaurants);
  } catch (error) {
    console.error('Geo query error:', error);
    res.status(500).json({ message: 'Failed to fetch nearby restaurants' });
  }
};
