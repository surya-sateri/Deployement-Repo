// import bcrypt from "bcryptjs";
// import mongoose, { Schema } from "mongoose";

// const restaurentSchema = new Schema(
//   {
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     type:{ type: String, default: false },
//     primaryphone:{type:Number, required:true},
//     secondaryphone:{type:Number, default: false},
//     country:{ type: String, default: false },
//     state:{ type: String, default: false },
//     district:{ type: String, default: false },
//     taluka:{ type: String, default: false },
//     address:{ type: String, default: false },
//     pincode: {type:Number, default: false},
//     openTime: { type: String, default: "" }, // Store time as string, e.g., "08:00 AM"
//     closeTime: { type: String, default: "" },
//     discount:{type:Number, default: false},
//     establishDate:{type:Date,default:false},
//     isActive: { type: Boolean, required: true, default: true },
//   },
//   { timestamps: true }
// );

// // const MenuSchema =new Schema(
// //   {
// //     restaurent_id: { type: Schema.Types.ObjectId, ref: "Restaurent", required: true },
// //     itemName:{ type: String,required: true, unique: true},
// //     price:{type:Number,require:true,default: null},
// //     category:{type:String,required: true,default: null},
// //     cuisineType:{type:String,required: false,default: null},
// //     description:{type:String,required:false,default: null},
// //     tags:{type:String,required:false,default: null},
// //     videoUrl:{type:String,required:false,default: null},
// //     availability:{type:Boolean,required:false,default: true},
// //     status:{type:Boolean,required:false,default: true},
// //     isActive:{type:Boolean,default: true},
    
// //   }
// // );


// const MenuSchema = new Schema(
//   {
//     restaurent_id: { type: Schema.Types.ObjectId, ref: "Restaurent", required: true },
//     itemName: { type: String, required: true, unique: true },
//     price: { type: Number, required: true, default: null },
//     category: { type: String, required: true, default: null },
//     cuisineType: { type: String, required: false, default: null },
//     description: { type: String, required: false, default: null },
//     tags: { type: String, required: false, default: null },
//     videoUrl: { type: String, required: false, default: null },
//     availability: { type: Boolean, required: false, default: true },
//     status: { type: Boolean, required: false, default: true },
//     isActive: { type: Boolean, default: true },
//     allergens: { type: String, required: false, default: null },
//     spicyness: { type: String, required: false, default: null },
//     calories: { type: String, required: false, default: null },
//     variants: { type: String, required: false, default: null },
//     dishCustomization: { type: String, required: false, default: null },
//     nutritions: { type: String, required: false, default: null },
//   }
// );

// const BookingsSchema = new Schema(
//   {
//     restaurent_id: { type: Schema.Types.ObjectId, ref: 'Restaurent', required: true },
//     name: { type: String, required: true },
//     email: { type: String, required: true }, // Removed unique: true
//     no_of_people: { type: Number, required: true, min: [1, 'Number of people must be at least 1'] },
//     coupon_code: { type: Schema.Types.ObjectId, ref: 'CouponData', required: false },
//     date_time: { type: Date, required: true },
//     primaryphone: { type: String, required: true }, // Changed to String
//     country: { type: String, default: '' },
//     state: { type: String, default: '' },
//     city: { type: String, default: '' },
//     address: { type: String, default: '' },
//     pincode: { type: Number, default: null },
//     status: { type: String, default: '' },
//     acceptedBy: { type: Schema.Types.ObjectId, ref: 'User' },
//     isActive: { type: Boolean, default: true },
//     booking_type: { type: String, default: 'Dinner' }, // Added booking_type field
//   },
//   { timestamps: true }
// );

// const CouponDataSchema = new Schema(
//   {
//     // booking_id: { type: Schema.Types.ObjectId, ref: "Bookings", required: true }, // Reference to Bookings
//     couponMetaData:{ type: Schema.Types.ObjectId, ref: "CouponMetaData", required: true }, // Reference to CouponMetaData
//     code: { type: String, required: true, unique: true },
//     discount: { type: Number, required: true }, // Discount percentage or amount
//     expiry_date: { type: Date, required: true },
//     min_purchase: { type: Number, default: 0 }, // Minimum purchase amount to apply the coupon
//     max_discount: { type: Number, default: null }, // Maximum discount limit
//     usage_limit: { type: Number, default: 1 }, // Number of times the coupon can be used
//     used_count: { type: Number, default: 0 }, // Number of times it has been used
//     isActive: { type: Boolean, default: true },
//   },
//   { timestamps: true }
// );


// const CouponMetaDataSchema = new Schema(
//   {
//     restaurent_id: { type: Schema.Types.ObjectId, ref: "Restaurent", required: true },
//     id: { type: Number,unique: true }, 
//     discount: { type: Number, required: true }, // Discount percentage or amount
//     expiry_date: { type: Date, required: true },
//     min_purchase: { type: Number, default: 0 }, // Minimum purchase amount to apply the coupon
//     max_discount: { type: Number, default: null }, // Maximum discount limit
//     usage_limit: { type: Number, default: 1 }, // Number of times the coupon can be used
//     used_count: { type: Number, default: 0 }, // Number of times it has been used
//     isActive: { type: Boolean, default: true },
//   },
//   { timestamps: true }
// );
//   const restaurantGallerySchema = new Schema(
//     {
//       restaurent_id: { type: Schema.Types.ObjectId, ref: "Restaurent", required: true },
//       path: { type: String, required: true },
//       isActive: { type: Boolean, default: true },
//       ext:{type:String,required:false,default: null},
//       originalName:{type:String,required:false,default: null},
//       newName:{type:String,required:false,default: null},
//       isVideo:{type:Boolean,required:false,default: null},
//       isImage:{type:Boolean,required:false,default: null},

//     },
//     { timestamps: true
//     }
//   )

// const ReviewsRatingsSchema = new Schema(
//   {
//     restaurent_id: { type: Schema.Types.ObjectId, ref: "Restaurent", required: true },
//     name: { type: String, required: true }, 
//     rating: { type: Number, required: true },
//     review: { type: String, required: true },
//     isActive: { type: Boolean, default: true },
//   },
//   { timestamps: true }
// );
// const CounterSchema = new Schema({
//   name: { type: String, required: true },
//   seq: { type: Number, default: 0 },
// });
// const Counter = mongoose.model("Counter", CounterSchema);
// const Bookings = mongoose.model("Bookings", BookingsSchema);
// const CouponData = mongoose.model("CouponData", CouponDataSchema);
// const CouponMetaData = mongoose.model("CouponMetaData", CouponMetaDataSchema);
// const Restaurent = mongoose.model("Restaurent", restaurentSchema);
// const Menu = mongoose.model("Menu",MenuSchema);
// const ReviewsRatings = mongoose.model("ReviewsRatings",ReviewsRatingsSchema);
// const RestaurantGallery = mongoose.model("RestaurantGallery", restaurantGallerySchema);



// const restaurantSchema = new mongoose.Schema({
//   name: String,
//   address: String,
//   image: String,
//   location: {
//     type: {
//       type: String,
//       enum: ['Point'],
//       required: true,
//     },
//     coordinates: {
//       type: [Number], // [longitude, latitude]
//       required: true,
//     },
//   },
// });

// restaurantSchema.index({ location: '2dsphere' });

// module.exports = mongoose.model('Restaurant', restaurantSchema);




// export {Restaurent, Bookings, CouponData, CouponMetaData,Menu,ReviewsRatings,Counter,RestaurantGallery};

import bcrypt from "bcryptjs";
import mongoose, { Schema } from "mongoose";

// Restaurent Schema
const restaurentSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    type: { type: String, default: false },
    primaryphone: { type: Number, required: true },
    secondaryphone: { type: Number, default: false },
    country: { type: String, default: false },
    state: { type: String, default: false },
    district: { type: String, default: false },
    taluka: { type: String, default: false },
    address: { type: String, default: false },
    pincode: { type: Number, default: false },
    openTime: { type: String, default: "" },
    closeTime: { type: String, default: "" },
    discount: { type: Number, default: false },
    establishDate: { type: Date, default: false },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

// Menu Schema
const MenuSchema = new Schema(
  {
    restaurent_id: { type: Schema.Types.ObjectId, ref: "Restaurent", required: true },
    itemName: { type: String, required: true, unique: true },
    price: { type: Number, required: true, default: null },
    menucode: { type: String, required: true, unique: true, }, // Added menucode field
    category: { type: String, required: true, default: null },
    cuisineType: { type: String, required: false, default: null },
    description: { type: String, required: false, default: null },
    tags: { type: String, required: false, default: null },
    videoUrl: { type: String, required: false, default: null },
    availability: { type: Boolean, required: false, default: true },
    status: { type: Boolean, required: false, default: true },
    isActive: { type: Boolean, default: true },
    allergens: { type: String, required: false, default: null },
    spicyness: { type: String, required: false, default: null },
    calories: { type: String, required: false, default: null },
    variants: { type: String, required: false, default: null },
    dishCustomization: { type: String, required: false, default: null },
    nutritions: { type: String, required: false, default: null },
  }
);

// Bookings Schema
const BookingsSchema = new Schema(
  {
    restaurent_id: { type: Schema.Types.ObjectId, ref: "Restaurent", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    no_of_people: { type: Number, required: true, min: [1, "Number of people must be at least 1"] },
    coupon_code: { type: Schema.Types.ObjectId, ref: "CouponData", required: false },
    date_time: { type: Date, required: true },
    primaryphone: { type: String, required: true },
    country: { type: String, default: "" },
    state: { type: String, default: "" },
    city: { type: String, default: "" },
    address: { type: String, default: "" },
    pincode: { type: Number, default: null },
    status: { type: String, default: "" },
    acceptedBy: { type: Schema.Types.ObjectId, ref: "User" },
    isActive: { type: Boolean, default: true },
    booking_type: { type: String, default: "Dinner" },
  },
  { timestamps: true }
);

// CouponData Schema
const CouponDataSchema = new Schema(
  {
    couponMetaData: { type: Schema.Types.ObjectId, ref: "CouponMetaData", required: true },
    code: { type: String, required: true, unique: true },
    discount: { type: Number, required: true },
    expiry_date: { type: Date, required: true },
    min_purchase: { type: Number, default: 0 },
    max_discount: { type: Number, default: null },
    usage_limit: { type: Number, default: 1 },
    used_count: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// CouponMetaData Schema
const CouponMetaDataSchema = new Schema(
  {
    restaurent_id: { type: Schema.Types.ObjectId, ref: "Restaurent", required: true },
    id: { type: Number, unique: true },
    discount: { type: Number, required: true },
    expiry_date: { type: Date, required: true },
    min_purchase: { type: Number, default: 0 },
    max_discount: { type: Number, default: null },
    usage_limit: { type: Number, default: 1 },
    used_count: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// RestaurantGallery Schema
const restaurantGallerySchema = new Schema(
  {
    restaurent_id: { type: Schema.Types.ObjectId, ref: "Restaurent", required: true },
    path: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    ext: { type: String, required: false, default: null },
    originalName: { type: String, required: false, default: null },
    newName: { type: String, required: false, default: null },
    isVideo: { type: Boolean, required: false, default: null },
    isImage: { type: Boolean, required: false, default: null },
  },
  { timestamps: true }
);

// ReviewsRatings Schema
const ReviewsRatingsSchema = new Schema(
  {
    restaurent_id: { type: Schema.Types.ObjectId, ref: "Restaurent", required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    review: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Counter Schema
const CounterSchema = new Schema({
  name: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

// Restaurant Schema
const restaurantSchema = new mongoose.Schema({
  name: String,
  address: String,
  image: String,
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
});
restaurantSchema.index({ location: "2dsphere" });

// Define all models
const Restaurent = mongoose.model("Restaurent", restaurentSchema);
const Menu = mongoose.model("Menu", MenuSchema);
const Bookings = mongoose.model("Bookings", BookingsSchema);
const CouponData = mongoose.model("CouponData", CouponDataSchema);
const CouponMetaData = mongoose.model("CouponMetaData", CouponMetaDataSchema);
const RestaurantGallery = mongoose.model("RestaurantGallery", restaurantGallerySchema);
const ReviewsRatings = mongoose.model("ReviewsRatings", ReviewsRatingsSchema);
const Counter = mongoose.model("Counter", CounterSchema);
const Restaurant = mongoose.model("Restaurant", restaurantSchema); // Define Restaurant model

// Export all models using ES module syntax
export {
  Restaurent,
  Bookings,
  CouponData,
  CouponMetaData,
  Menu,
  ReviewsRatings,
  Counter,
  RestaurantGallery,
  Restaurant, // Include Restaurant in exports
};
