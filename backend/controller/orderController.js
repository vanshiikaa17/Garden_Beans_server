const Orders = require("../models/orderModel");
const Product = require("../models/productModel");
//creating a new order
const newOrder = async (req, res) => {
  try {
    const {
      shippingDetails,
      orderItems,
      payment,
      totalPrice,
      taxPrice,
      shippingPrice,
      grandTotal,
    } = req.body;

    const order = await Orders.create({
      shippingDetails,
      orderItems,
      payment,
      totalPrice,
      taxPrice,
      shippingPrice,
      grandTotal,
      paymentAt: Date.now(),
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      order,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// get a particular order
const getSingleUserOrders = async (req, res) => {
  try {
    const orders = await Orders.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!orders) {
      return res.status(404).json("Order not found");
    }

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Logged-in user- get all orders
const getAllOrders = async (req, res) => {
  try {
    const myorders = await Orders.find({ user: req.user._id });
    res.status(200).json({
      success: true,
      myorders,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
//ADMIN - get all orders of a particular user
const getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await Orders.find();

    let totalAmount = 0;

    orders.forEach((order) => {
      totalAmount += order.grandTotal;
    });
    res.status(200).json({
      success: true,
      orders,
      totalAmount,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

//ADMIN- update order status
const updateStatus = async (req, res) => {
  try {
    const order = await Orders.findById(req.params.id);
    // console.log(req.params.id);

    if (!order) {
        return res.status(404).json("Order not found");
      }
    if (order.orderStatus == "Delivered") {
      return res.status(404).json("Order is already delivered");
    }

    //updating stock of the order in the database
    if(req.body.status==="Shipped"){
      order.orderItems.forEach(async (o) => {
        await updateStock(o.product, o.quantity);
      });
    }

    order.orderStatus = req.body.status;
    console.log(req.body.status);
    if (req.body.status === "Delivered") {
      order.deliveryDate = Date.now();
    }
    await order.save({ validateBeforeSave: false });
    res.status(200).json({
      success: true,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

//to update stock

async function updateStock(id, qty) {
  const product = await Product.findById(id);

  product.stock -= qty;

  await product.save({ validateBeforeSave: false });
}

//ADMIN- delete order
const deleteOrder = async (req, res) => {
  try {
    const order = await Orders.findById(req.params.id);
    if (!order) {
      return res.status(404).json("Order not found");
    }
    await order.remove();

    res.status(200).json({
      success: true,
      message: "order deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  newOrder,
  getSingleUserOrders,
  getAllOrders,
  getAllOrdersAdmin,
  updateStatus,
  deleteOrder,
};
