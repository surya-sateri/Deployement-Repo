import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const LoginSchema = new Schema(
  {
    userName: { type: String, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    userType: { type: String, required: false, default: "Master" },
    mobileNo: { type: String },
    user_id:{ type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    tenant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Tenants" },
    restaurant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurants" },
    role_id: { type: String, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

LoginSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

LoginSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const TenantsSchema = new Schema(
  {
    login_id: { type: mongoose.Schema.Types.ObjectId, ref: "Login" },
    restaurant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurants",
      required: true,
    },
    dbName: { type: String, required: true },
    dbUrl: { type: String, required: false },
    active: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Login" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Login" },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

const NavigationBarSchema = new Schema(
  {
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
  },
  {
    timestamps: true,
  }
);

const UserNavigationBarSchema = new Schema(
  {
    login_id: { type: Schema.Types.ObjectId, ref: "Login", required: true },        // User
    tenant_id: { type: Schema.Types.ObjectId, ref: "Tenant"  },    //required: true  // Optional depending on multi-tenancy
    restaurant_id: { type: Schema.Types.ObjectId, ref: "Restaurant" }, //, required: true
    isDropdown: { type: Boolean, default: false },
    main_menu_id: { type: Schema.Types.ObjectId, ref: "NavigationBar", required: true },
    sub_menu_id: { type: String, default: null },
    permissions:{type:String },
    createdBy: { type: Schema.Types.ObjectId, ref: "Login" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "Login" },
  },
  { timestamps: true }
);

//---------------------------------------------------------------------------------------


const RolesSchema = new mongoose.Schema({
  role: { type: String, required: true, unique: true }, // Unique role name
  description: { type: String }, // Role description
  isActive: { type: Boolean, default: true }, // Active or inactive status
  createdAt: { type: Date, default: Date.now }, // Timestamp for creation
  updatedAt: { type: Date, default: Date.now }, // Timestamp for update
});

const UsersSchema = new Schema(
  {
    restaurent_id: { type: Schema.Types.ObjectId, ref: "Restaurent" },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    dob: { type: Date, default: null },
    primaryphone: { type: Number, required: true },
    secondaryphone: { type: Number, required: false },
    country: { type: String, required: false },
    state: { type: String, required: false },
    district: { type: String, required: false },
    taluka: { type: String, required: false },
    address: { type: String, required: false },
    pincode: { type: Number, required: false },
    bankname: { type: String, required: false },
    accountnumber: { type: Number, required: false },
    ifsccode: { type: String, required: false },
    branchname: { type: String, required: false },
    adharnumber: { type: Number, required: false },
    pannumber: { type: String, required: false },
    password: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    role_id: { type: String, default: null },
  },
  { timestamps: true }
);

UsersSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UsersSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
const CategorySchema = new mongoose.Schema({
  categoryName: { type: String, required: true, unique: true }, // Category name
  description: { type: String }, // Optional description
  isActive: { type: Boolean, default: true }, // Status (active/inactive)
  sequence: { type: Number, default: null }, // Order of categories
  createdAt: { type: Date, default: Date.now }, // Timestamp for creation
  updatedAt: { type: Date, default: Date.now }, // Timestamp for update
});

const SubCategorySchema = new mongoose.Schema({
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  }, // Reference to Category
  subCategoryName: { type: String, required: true, unique: true }, // Subcategory name
  description: { type: String }, // Optional description
  isActive: { type: Boolean, default: true }, // Status (active/inactive)
  sequence: { type: Number, default: null }, // Order of subcategories
  createdAt: { type: Date, default: Date.now }, // Timestamp for creation
  updatedAt: { type: Date, default: Date.now }, // Timestamp for update
});

const SuperPermissionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }, // Reference to UserSchema
  restaurent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurent",
    required: true,
  }, // Reference to RestaurentSchema
  role_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
    required: true,
  }, // Reference to RoleSchema
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  }, // Reference to CategorySchema
  subcategory_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubCategory",
    required: true,
  }, // Reference to SubCategorySchema
  component: { type: String, required: true }, // Name of the component
  access: {
    type: String,
    enum: ["read", "write", "update", "delete", "full"],
    required: true,
  }, // Access levels
  isActive: { type: Boolean, default: true }, // Status (active/inactive)
  sequence: { type: Number, default: null }, // Order of permissions
  createdAt: { type: Date, default: Date.now }, // Timestamp for creation
  updatedAt: { type: Date, default: Date.now }, // Timestamp for update
});

const ClientsSchema = new Schema(
  {
    name: { type: String, required: true },
    restaurant_id: { type: Schema.Types.ObjectId, ref: "Restaurants" },
    email: { type: String, required: true, unique: true },
    primaryphone: { type: Number, required: true },
    secondaryphone: { type: Number, required: false },
    country: { type: String, required: false },
    state: { type: String, required: false },
    district: { type: String, required: false },
    taluka: { type: String, required: false },
    address: { type: String },
    pincode: { type: Number },
    bankname: { type: String, required: false },
    accountnumber: { type: Number, required: false },
    ifsccode: { type: String, required: false },
    branchname: { type: String, required: false },
    adharnumber: { type: Number, required: false },
    pannumber: { type: String, required: false },
    password: { type: String, required: true },
    isActive: { type: Boolean, required: true, default: true },
    role_id: { type: Schema.Types.ObjectId, ref: "Roles" },
  },
  { timestamps: true }
);

ClientsSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

ClientsSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const RestaurantsSchema = new Schema(
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
    openTime: { type: String, default: "" }, // Store time as string, e.g., "08:00 AM"
    closeTime: { type: String, default: "" },
    discount: { type: Number, default: false },
    establishDate: { type: Date, default: false },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);
const permissionSchema = new mongoose.Schema(
  {
    login_id: {type: mongoose.Schema.Types.ObjectId, ref: "User",required: true},
    tenant_id: {type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true,},
    restaurant_id: {type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
    isDropdown: {type: Boolean, default: false,},
    main_menu_id: {type: mongoose.Schema.Types.ObjectId, ref: "MainMenu", required: true},
    sub_menu_id: {type: mongoose.Schema.Types.ObjectId,ref: "SubMenu", required: false,},
    permissions: {type: [String], default: [],},
  },
  { timestamps: true }
);
const actionSchema = new mongoose.Schema({
  isDropdown: {type: Boolean,default: false},
  main_menu_id: {type: String , required: true},
  sub_menu_id: {type: String, required: true},
  Actions: {type: [String], default: []}
}, { timestamps: true });

const SuperPermission = mongoose.model("SuperPermission",SuperPermissionSchema);
const SubCategory = mongoose.model("SubCategory", SubCategorySchema);
const Category = mongoose.model("Category", CategorySchema);
const Users = mongoose.model("Users", UsersSchema);
const Login = mongoose.model("Login", LoginSchema);
const Tenants = mongoose.model("Tenants", TenantsSchema);
const Restaurants = mongoose.model("Restaurants", RestaurantsSchema);
const Clients = mongoose.model("Clients", ClientsSchema);
const NavigationBar = mongoose.model("NavigationBar", NavigationBarSchema);
const UserNavigationBar = mongoose.model("UserNavigationBar", UserNavigationBarSchema);
const Roles = mongoose.model("Roles", RolesSchema);
const Permission = mongoose.model("Permission", permissionSchema);
const Action = mongoose.model("Action", actionSchema);

export {
  Login,
  Tenants,
  Restaurants,
  Clients,
  NavigationBar,
  UserNavigationBar,
  Users,
  Category,
  SubCategory,
  SuperPermission,
  Roles,
  Permission,
  Action
};
