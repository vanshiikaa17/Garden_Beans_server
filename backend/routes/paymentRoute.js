const express=require("express");
const { payment, sendAPIKey } = require("../controller/paymentController");

const router = express.Router();
const {isAuthenticated} = require("../middleware/auth");

//new payment
router.route("/process/newpayment").post(isAuthenticated, payment)

//sending stripe API key
router.route("/stripeapi").get(isAuthenticated, sendAPIKey);

module.exports=router;