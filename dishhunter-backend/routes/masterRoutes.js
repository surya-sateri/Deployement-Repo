import express from "express";
import {loginUser,AddUser, getUserList, SoftDeleteUser, updateUser, getUserById,deleteUser} from "../controllers/MasterController/AuthController.js"
import { isMasterRoute, protectRoute } from "../middleware/authMiddlewave.js";
import { AddRestaurant, getRestaurantList, SoftDeleteRestaurant,updateRestaurantById, getRestaurantById,addClient, getClientList,updateClient,getClientById, SoftDeleteClient,deleteRestaurant, deleteClient } from "../controllers/MasterController/TenantController.js";

import multer from 'multer';


import { AddAccessModulesToUserOrClient, GetNavigationBarList, GetRoleList, CreateRole, UpdateAccessModuleToUserOrClient,deleteAccess,GetUserNavigationBar, getNavigationBarMenu, AddNavigationBar, updateNavigationBar,addAction ,getActionList,updateAction,getActionById,deleteAction, UpdateRole, GetRoleById,AddActionPermission, getNavigationBarByUserId,deleteNavigationBar,getNavigationBarById, UpdateNavigationBar, getNavigationBarItemById,UpdateActionPermission,GetActionPermissionList,GetActionPermissionUpdate,GetActionPermissionAdd,deleteActionPermission,deleteRole} from "../controllers/MasterController/MasterController.js";

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.post("/login", loginUser);

router.post("/add-user", protectRoute,isMasterRoute, AddUser);
router.get("/get-user-list", protectRoute,isMasterRoute,getUserList);
router.post('/soft-delete-user/:id', protectRoute,isMasterRoute, SoftDeleteUser)
router.put("/update-user/:id", protectRoute,isMasterRoute, updateUser);
router.get('/get-user-by-id/:id',protectRoute,isMasterRoute, getUserById);
router.delete('/delete-user/:id', protectRoute,isMasterRoute, deleteUser);

router.post("/add-restaurant",upload.single('file'),protectRoute,isMasterRoute, AddRestaurant);
router.get("/get-restaurant-list",protectRoute,isMasterRoute, getRestaurantList);
router.post('/soft-delete-restaurant/:id', protectRoute,isMasterRoute, SoftDeleteRestaurant)
router.post('/update-restaurant/:id', protectRoute,isMasterRoute, updateRestaurantById);
router.get('/get-restaurant-by-id/:id', protectRoute,isMasterRoute, getRestaurantById);
router.delete('/delete-restaurant/:id', protectRoute,isMasterRoute, deleteRestaurant);

router.post("/add-client",protectRoute,isMasterRoute, addClient);
router.get("/get-client-list",protectRoute,isMasterRoute, getClientList);
router.put("/update-client/:id", protectRoute,isMasterRoute, updateClient);
router.get("/get-client-by-id/:id", protectRoute,isMasterRoute, getClientById);
router.post('/soft-delete-client/:id', protectRoute,isMasterRoute, SoftDeleteClient);
router.delete('/delete-client/:id', protectRoute,isMasterRoute, deleteClient);

router.get("/get-roles-list",protectRoute,isMasterRoute,GetRoleList);
router.get("/get-role/:id", protectRoute, isMasterRoute, GetRoleById);
router.post("/create-role",protectRoute,isMasterRoute,CreateRole);
router.put("/update-role/:id", protectRoute, isMasterRoute, UpdateRole);
router.delete("/delete-role/:id", protectRoute, isMasterRoute, deleteRole);
//---------------------------
router.get("/get-navigationbar-list",protectRoute,isMasterRoute,GetNavigationBarList);
router.get("/get-navigationbar-item/:id",protectRoute,isMasterRoute,getNavigationBarItemById)
router.put("/update-navigationbar/:id",protectRoute,isMasterRoute,UpdateNavigationBar)
//---------------------------
router.get("/get-user-navigation-bar/:userId",protectRoute,isMasterRoute,GetUserNavigationBar);
router.post("/add-access-module-to-user-or-client",protectRoute,isMasterRoute,AddAccessModulesToUserOrClient);
router.put("/update-access-module-to-user-or-client/:userId",protectRoute,isMasterRoute,UpdateAccessModuleToUserOrClient);
router.delete("/delete-access/:id", protectRoute, isMasterRoute, deleteAccess);

router.get("/get-navigationbar-menu",protectRoute,isMasterRoute,getNavigationBarMenu)
router.post("/add-navigation-bar",protectRoute,isMasterRoute,AddNavigationBar);
router.put("/update-navigation-bar/:id",protectRoute,isMasterRoute,updateNavigationBar)
router.delete("/delete-navigationbar/:id", protectRoute, isMasterRoute, deleteNavigationBar)

router.get("/get-navigation-bar-By-User-id/:userId", protectRoute,isMasterRoute, getNavigationBarByUserId);
router.post("/add-action",protectRoute,isMasterRoute,addAction)
router.get("/get-action-list",protectRoute,isMasterRoute,getActionList)
router.put("/update-action/:id",protectRoute,isMasterRoute,updateAction)
router.get("/get-action-by-id/:id",protectRoute,isMasterRoute,getActionById)
router.delete("/delete-action/:id",protectRoute,isMasterRoute,deleteAction)


router.get('/get-navigationbar/:id', protectRoute, isMasterRoute, getNavigationBarById);

router.post("/add-action-permission",protectRoute,isMasterRoute,AddActionPermission);
router.put("/update-action-permission/:userId",protectRoute,isMasterRoute,UpdateActionPermission);
router.delete('/delete-action-permission/:id',protectRoute, isMasterRoute, deleteActionPermission)

router.post("/get-action-permission-list", protectRoute, isMasterRoute, GetActionPermissionList);
router.post("/get-action-permission-update", protectRoute, isMasterRoute,GetActionPermissionUpdate);
router.post("/get-action-permission-add", protectRoute,isMasterRoute, GetActionPermissionAdd);

export default router;

