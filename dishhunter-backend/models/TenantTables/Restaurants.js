import bcrypt from "bcryptjs";
import mongoose, { Schema } from "mongoose";

export const getTenantRestaurantModels = (tenantDb) => {
    const MembersSchema = new mongoose.Schema(
        {
            name: { type: String, required: true },
           // restaurent_id: { type: Schema.Types.ObjectId, ref: "Restaurent" },
            email: { type: String, required: true, unique: true },
            primaryphone: { type: Number, required: true },
            secondaryphone: { type: Number, required: false },
            country: { type: String, required: false },
            state: { type: String, required: false },
            district: { type: String, required: false },
            taluka: { type: String, required: false },
            address: { type: String },
            pincode: { type: Number },
            adharnumber: { type: Number, required: false },
            pannumber: { type: String, required: false },
            password: { type: String, required: true },
            isActive: { type: Boolean, default: true },
            role_id: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
        },
        { timestamps: true }
    );

    // MembersSchema.pre("save", async function (next) {
    //     if (!this.isModified("password")) {
    //         next();
    //     }

    //     const salt = await bcrypt.genSalt(10);
    //     this.password = await bcrypt.hash(this.password, salt);
    // });

    // MembersSchema.methods.matchPassword = async function (enteredPassword) {
    //     return await bcrypt.compare(enteredPassword, this.password);
    // };

    const MenusSchema = new Schema(
        {
            itemName: { type: String, required: true, unique: true },
            price: { type: Number, required: true, default: null },
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

    const BookingsSchema = new Schema(
        {
            restaurant_id:{type: Schema.Types.ObjectId, ref: "Restaurent", required: true},
            name: { type: String, required: true },
            email: { type: String, required: true }, // Removed unique: true
            no_of_people: { type: Number, required: true, min: [1, 'Number of people must be at least 1'] },
           // coupon_code: { type: Schema.Types.ObjectId, ref: 'CouponData', required: false },
            date_time: { type: Date, required: true },
            primaryphone: { type: String, required: true }, // Changed to String
            country: { type: String, default: '' },
            state: { type: String, default: '' },
            city: { type: String, default: '' },
            address: { type: String, default: '' },
            pincode: { type: Number, default: null },
            status: { type: String, default: '' },
           // acceptedBy: { type: Schema.Types.ObjectId, ref: 'User' },
            isActive: { type: Boolean, default: true },
            booking_type: { type: String, default: 'Dinner' }, // Added booking_type field
        },
        { timestamps: true }
    );

    const CouponDataSchema = new Schema(
        {
            // booking_id: { type: Schema.Types.ObjectId, ref: "Bookings", required: true }, // Reference to Bookings
            couponMetaData: { type: Schema.Types.ObjectId, ref: "CouponMetaData", required: true }, // Reference to CouponMetaData
            code: { type: String, required: true, unique: true },
            discount: { type: Number, required: true }, // Discount percentage or amount
            expiry_date: { type: Date, required: true },
            min_purchase: { type: Number, default: 0 }, // Minimum purchase amount to apply the coupon
            max_discount: { type: Number, default: null }, // Maximum discount limit
            usage_limit: { type: Number, default: 1 }, // Number of times the coupon can be used
            used_count: { type: Number, default: 0 }, // Number of times it has been used
            isActive: { type: Boolean, default: true },
        },
        { timestamps: true }
    );


    const CouponMetaDataSchema = new Schema(
        {
            restaurant_id: { type: Schema.Types.ObjectId, ref: "Restaurent", required: true },
            id: { type: Number, unique: true },
            discount: { type: Number, required: true }, // Discount percentage or amount
            expiry_date: { type: Date, required: true },
            min_purchase: { type: Number, default: 0 }, // Minimum purchase amount to apply the coupon
            max_discount: { type: Number, default: null }, // Maximum discount limit
            usage_limit: { type: Number, default: 1 }, // Number of times the coupon can be used
            used_count: { type: Number, default: 0 }, // Number of times it has been used
            isActive: { type: Boolean, default: true },
        },
        { timestamps: true }
    );
    const RestaurantGallerySchema = new Schema(
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
        {
            timestamps: true
        }
    )

    const ReviewsRatingsSchema = new Schema(
        {
            // restaurent_id: { type: Schema.Types.ObjectId, ref: "Restaurent", required: true },
            name: { type: String, required: true },
            rating: { type: Number, required: true },
            review: { type: String, required: true },
            isActive: { type: Boolean, default: true },
        },
        { timestamps: true }
    );
    const CounterSchema = new Schema({
        name: { type: String, required: true },
        seq: { type: Number, default: 0 },
    });
        return {
        Members: tenantDb.models.Members || tenantDb.model('Members', MembersSchema),
        Menus: tenantDb.models.Menus || tenantDb.model('Menus', MenusSchema),
        Bookings: tenantDb.models.Bookings || tenantDb.model('Bookings', BookingsSchema),
        CouponData: tenantDb.models.CouponData || tenantDb.model('CouponData', CouponDataSchema),
        CouponMetaData: tenantDb.models.CouponMetaData || tenantDb.model('CouponMetaData', CouponMetaDataSchema),
        RestaurantGallery: tenantDb.models.RestaurantGallery || tenantDb.model('RestaurantGallery', RestaurantGallerySchema),
        ReviewsRatings: tenantDb.model('ReviewsRatings', ReviewsRatingsSchema),
        Counter: tenantDb.models.Counter || tenantDb.model('Counter', CounterSchema),
    };

    

};
