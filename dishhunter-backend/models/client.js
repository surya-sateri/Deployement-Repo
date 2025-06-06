import bcrypt from "bcryptjs";
import mongoose, { Schema } from "mongoose";

const clientSchema = new Schema(
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
    bankname:{ type: String, required: false },
    accountnumber:{ type: Number, required: false },
    ifsccode:{ type: String, required: false },
    branchname:{ type: String, required: false },
    adharnumber:{ type: Number, required: false },
    pannumber:{ type: String, required: false },
    password: { type: String, required: true },
    isActive: { type: Boolean, required: true, default: true },
    role: { type: String, required: true },
  },
  { timestamps: true }
);

clientSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

clientSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Client = mongoose.model("Client", clientSchema);

export default Client;