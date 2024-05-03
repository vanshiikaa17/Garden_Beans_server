const app=require("./app");
const dotenv=require("dotenv");
const cloudinary=require('cloudinary')
const connectToMongo=require("./config/db");


//handling uncaught exceptions
process.on("uncaughtException", (err)=>{
    console.log(`Error: ${err.message}`);
    console.log("Shutting down the server due to uncaught exception");
    process.exit(1);
})

//config
dotenv.config({path:"backend/config/config.env"});
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET

})

//database
connectToMongo();

const server=app.listen(process.env.PORT, ()=>{
    console.log(`ecommerce app listening at http://localhost:${process.env.PORT}`);
})

//unhandled promise rejection error handling
process.on("unhandledRejection",(err)=>{
    console.log(`Error:${err}`);
    console.log("Shutting down the server due to unhandled promise rejection");

    server.close(()=>{
        process.exit(1);
    });
})

//node.js supported version -- v16.14.0