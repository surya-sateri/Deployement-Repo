import { getTenantRestaurantModels } from "../../models/TenantTables/Restaurants.js";
import moment from "moment";

export const addReviewAndRating = async (req, res) => {
  try {
    const { name, rating, review, isActive } = req.body;
    const { ReviewsRatings } = getTenantRestaurantModels(req.tenantConnection);

    const newreview = await ReviewsRatings.create({
      name,
      rating,
      review,
      isActive,
    });

    if (newreview) {
      res.status(201).json({
        status: true,
        message: "Review added successfully",
      });
    } else {
      return res.status(400).json({
        status: false,
        message: "An issue occurred while adding review. Please try again. ",
      });
    }
  } catch (error) {
    return res.status(400).json({ status: false, message: error.message });
  }
};

// Book table
export const addTableBooking = async (req, res) => {
  try {
    // console.log("Incoming booking payload:", req.body); // ✅ helpful for debugging
    // console.log("Received addBooking request body:", req.body);

    const {
      restaurant_id,
      name,
      email,
      no_of_people,
      //coupon_code,
      date_time,
      address,
      city,
      state,
      pincode,
      primaryphone,
      country,
      isActive ,
      booking_type 
    } = req.body;

    console.log("Getting Data",req.body)
//     console.log('BODY:', req.body);
//     console.log("Headers:", req.headers);
// console.log("Body type:", typeof req.body);
// console.log("Full Body:", req.body);



    const { Bookings, CouponData, CouponMetaData } = getTenantRestaurantModels(
      req.tenantConnection
    );

    const requiredFields = {
      restaurant_id ,
      name,
      email,
      no_of_people,
      date_time,
      primaryphone,
    };
  
    console.log("Restaurant Id",restaurant_id)

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

      console.log("Missing Fields",missingFields)
    if (missingFields.length > 0) {
      return res.status(400).json({
        status: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    const bookingDate = new Date(date_time);
    if (isNaN(bookingDate.getTime())) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid date_time format" });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid email format" });
    }

    if (!Number.isInteger(Number(no_of_people)) || no_of_people < 1) {
      return res
        .status(400)
        .json({
          status: false,
          message: "Number of people must be a positive integer",
        });
    }

    const startOfDay = moment(bookingDate).startOf("day").toDate();
    const endOfDay = moment(bookingDate).endOf("day").toDate();
    const bookingExist = await Bookings.findOne({
      primaryphone: Number(primaryphone),
      date_time: { $gte: startOfDay, $lte: endOfDay },
    });

    if (bookingExist) {
      return res.status(400).json({
        status: false,
        message: "Booking already exists for this phone number today",
      });
    }

    // let couponData = null;
    // if (coupon_code) {
    //   couponData = await CouponData.findOne({
    //     code: coupon_code,
    //     isActive: true,
    //   });
    //   if (!couponData) {
    //     return res
    //       .status(400)
    //       .json({ status: false, message: "Invalid or inactive coupon code" });
    //   }
    // } else {
    //   const couponMeta = await CouponMetaData.findOne({ discount: 10 });
    //   if (!couponMeta) {
    //     return res
    //       .status(400)
    //       .json({ status: false, message: "No valid coupon metadata found" });
    //   }

    //   const generatedCouponCode = `COUPON-${Date.now()}`;
    //   couponData = await CouponData.create({
    //     couponMetaData: couponMeta._id,
    //     code: generatedCouponCode,
    //     discount: couponMeta.discount,
    //     expiry_date: moment().add(7, "days").toDate(),
    //     min_purchase: couponMeta.min_purchase,
    //     max_discount: couponMeta.max_discount,
    //     usage_limit: couponMeta.usage_limit,
    //     used_count: couponMeta.used_count,
    //     isActive: true,
    //   });
    // }

    const booking = await Bookings.create({
      restaurant_id,
      name,
      email,
      no_of_people: Number(no_of_people),
     // coupon_code: couponData?._id || null,
      date_time: bookingDate,
      primaryphone: Number(primaryphone),
      country: country || "",
      state: state || "",
      city: city || "",
      address: address || "",
      pincode: pincode ? Number(pincode) : 123,
      isActive,
      booking_type,
      status: "",
    });

    console.log("Booking",booking)
    const data = await Bookings.findOne({primaryphone})
    console.log(data)

    

    return res.status(201).json({
      success: true,
      message: "Booking added successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return res.status(400).json({ status: false, message: error.message });
  }
};
//getAllBookings
export const getAllBookings = async (req, res) => {
  try {
    const { Bookings } = getTenantRestaurantModels(req.tenantConnection);
    const { restaurant_id } = req.query;

    const filter = {};
    if (restaurant_id) {
      filter.restaurant_id = restaurant_id;
    }

    const allBookings = await Bookings.find(filter).populate("restaurant_id");

    return res.status(200).json({
      status: true,
      message: "Bookings fetched successfully",
      data: allBookings,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};
