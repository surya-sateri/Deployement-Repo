import express from "express";
import {
  registerUser,
  loginUser,
  getUserList,
  updateUserProfile,
  addSidebarMenu,
  updateSidebarMenu,
  getSidebarMenu,
  addRole,
  getRoles,
  updateRole,
  addCategory,
  getCategories,
  addSubCategory,
  updateCategory,
  getSubCategories,
  updateSubCategory,
  getSuperPermissions,
  getManagePermissions,
  getMapUserPermissionData,
  mapPermissionsToUser,
  updateUserDetails,
  getUserDetailsById,
  uploadUserDocument,
  changeUserIsActiveStatus,

} from "../controllers/userController.js";
import { protectRoute } from "../middleware/authMiddlewave.js";
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.post("/register",protectRoute, registerUser);
// update-user

router.post("/sidebar-menu",protectRoute, addSidebarMenu);
router.post("/update-sidebar-menu/:id",protectRoute, updateSidebarMenu);
router.get("/sidebar-menu",protectRoute, getSidebarMenu);
// active-inactive-sidebar-menu

// Role
router.post("/add-role",protectRoute, addRole);
router.get("/get-roles",protectRoute, getRoles);
router.post("/update-role/:id",protectRoute, updateRole);

// category 
router.post("/add-category",protectRoute, addCategory);
router.get("/get-category-list",protectRoute, getCategories);
router.post("/update-category/:id",protectRoute,updateCategory)

// subcategory
router.post("/add-subcategory",protectRoute, addSubCategory);
router.get("/get-subcategory-list",protectRoute, getSubCategories);
router.post("/update-subcategory/:id",protectRoute,updateSubCategory)

// permissions 
router.get("/get-permissions",protectRoute, getSuperPermissions);
router.get("/get-mapuserpermissiondata",protectRoute, getMapUserPermissionData);
router.post("/map-permissions-to-user",protectRoute, mapPermissionsToUser);
router.get("/manage-permission",protectRoute, getManagePermissions);


router.post("/login", loginUser);
router.get("/get-user-list", protectRoute,getUserList);
router.put("/profile", protectRoute, updateUserProfile);
router.post("/upload-user-document/:id",upload.single('file'), protectRoute, uploadUserDocument);
router.put("/update-user-details/:id", protectRoute, updateUserDetails);


router.post("/upload-user-document/:id",upload.single('file'), protectRoute, uploadUserDocument);
router.put("/update-user-details/:id", protectRoute, updateUserDetails);
router.get('/get-user-details-by-id/:id', getUserDetailsById);

router.post('/change-user-is-active-status/:id', protectRoute, changeUserIsActiveStatus)

export default router;