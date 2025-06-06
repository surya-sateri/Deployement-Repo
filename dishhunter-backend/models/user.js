import bcrypt from "bcryptjs";
import mongoose, { Schema } from "mongoose";

const RoleSchema = new mongoose.Schema({
  role: { type: String, required: true, unique: true }, // Unique role name
  description: { type: String }, // Role description
  isActive: { type: Boolean, default: true }, // Active or inactive status
  createdAt: { type: Date, default: Date.now }, // Timestamp for creation
  updatedAt: { type: Date, default: Date.now }, // Timestamp for update
});


const userSchema = new Schema(
  {
    restaurent_id: { type: Schema.Types.ObjectId, ref: "Restaurent"},
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    dob:{ type: Date, default: null },
    primaryphone:{type:Number,required:true},
    secondaryphone:{type:Number,required:false},
    country:{ type: String, required: false },
    state:{ type: String, required: false },
    district:{ type: String, required: false },
    taluka:{ type: String, required: false },
    address:{ type: String, required: false },
    pincode:{ type: Number, required: false },
    bankname:{ type: String, required: false },
    accountnumber:{ type: Number, required: false },
    ifsccode:{ type: String, required: false },
    branchname:{ type: String, required: false },
    adharnumber:{ type: Number, required: false },
    pannumber:{ type: String, required: false },
    password: { type: String, required: true },
    // isAdmin: { type: Boolean, required: true, default: false },
    isActive: { type: Boolean, default: true },
    role_id: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true }, 
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const SideBarSchema = new mongoose.Schema({
  title: { type: String, required: true },
  icon: { type: String },
  path: { type: String, default: null },
  dropdown: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  sequence: { type: Number, default: null },
  items: [
    {
      title: { type: String, required: true },
      path: { type: String, required: true },
      isActive: { type: Boolean, default: true }, 
      sequence: { type: Number, default: null },
    },
  ],
});


const Role = mongoose.model("Role", RoleSchema);
const SideBar = mongoose.model("SideBar", SideBarSchema);
const User = mongoose.model("User", userSchema);

export {SideBar, User,Role};