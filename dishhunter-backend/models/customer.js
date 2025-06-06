import bcrypt from "bcryptjs";
import mongoose, { Schema } from "mongoose";

const customerSchema = new Schema(
  {
    name: { type: String, required: true },
    restaurent_id: { type: Schema.Types.ObjectId, ref: "Restaurent" }, 
    email: { type: String, required: true, unique: true },
    primaryphone:{type:Number,required:true},
    secondaryphone:{type:Number,required:false},
    country:{ type: String, required: false },
    state:{ type: String, required: false },
    district:{ type: String, required: false },
    taluka:{ type: String, required: false },
    address:{ type: String },
    pincode:{ type: Number },
    adharnumber:{ type: Number, required: false },
    pannumber:{ type: String, required: false },
    password: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    role_id: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true }, 
  },
  { timestamps: true }
);

customerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

customerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;