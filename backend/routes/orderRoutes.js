const express=require("express");
const {newOrder, getSingleUserOrders, getAllOrders, getAllOrdersAdmin, updateStatus, deleteOrder}=require("../controller/orderController");
const { isAuthenticated, authorizedAccess } = require("../middleware/auth");
const router=express.Router();

//new order
router.route("/neworder").post(isAuthenticated,newOrder);

//orders of a single user
router.route("/orderinfo/:id").get(isAuthenticated,getSingleUserOrders);

//orders of logged in user
router.route("/myorders").get(isAuthenticated,getAllOrders);

//ADMIN- orders 
router.route("/admin/allorders").get(isAuthenticated,authorizedAccess("admin"),getAllOrdersAdmin);

//ADMIN- update order status and delete orders
router.route("/admin/order/:id").put(isAuthenticated,authorizedAccess("admin"),updateStatus).delete(isAuthenticated,authorizedAccess("admin"),deleteOrder);


module.exports=router;