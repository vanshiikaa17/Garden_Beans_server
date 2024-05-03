//this will check whether the user is logged in or not

const jwt=require("jsonwebtoken");
const User=require("../models/userModel");

const isAuthenticated = async(req, res, next)=>{
    try{
      const {authToken}=req.cookies;

     if(!authToken){
        return res.status(401).json("Please Login to access this resource.")
     }
    //  console.log(authToken);
    const data=jwt.verify(authToken, process.env.JWT_SECRET);
    req.user=await User.findById(data.id);  //saving all the user data in req.user 
    next(); ///the next funtion that is the function that loads all the products

    }catch(err){
        res.status(500).json("Internal server error");

    }

}

const authorizedAccess=(...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            // console.log("runnin")
           return ( res.status(401).json("Access denied"));
        }
        next(); 
    }
}

module.exports={isAuthenticated,authorizedAccess};