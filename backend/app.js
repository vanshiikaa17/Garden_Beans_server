const express= require('express');
const cookieParser=require('cookie-parser');
const app=express();
const  errorMiddleware=require("./middleware/error");
const bodyParser=require("body-parser");
const fileUpload=require("express-fileupload");
const dotenv=require("dotenv");
const cors=require("cors");

//config
dotenv.config({path:"backend/config/config.env"});
app.get("/", (req, res) => {
    res.json({ "server status": "running" });
  });
  

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}));
app.use(fileUpload());
app.use(cors());

//Route imports
const products=require("./routes/productRoute");
const users=require("./routes/userRoutes");
const orders=require("./routes/orderRoutes");
const payments=require("./routes/paymentRoute");

//middleware for errors
app.use(errorMiddleware);

app.use("/api/products", products);
app.use("/api/users", users);
app.use("/api/orders",orders);
app.use("/api/payments",payments);
module.exports=app;