const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
// const catchAsyncErrors=require("../middleware/catchAsyncError");
const cloudinary=require("cloudinary");


//user sign up
const signupUser = async (req, res) => {
 try{

    const myCloud=await cloudinary.v2.uploader.upload(req.body.avatar,{
      folder:"avatars",
      width:150,
      crop:"scale"
    });
    const { name, email,password } = req.body;
    //password's min length 8 is yet to be taken care of
    if( password.length <8){
      return res
        .status(400)
        .json({ success: false, message: "Password must have atleast 8 characters" });
    }
    const salt = await bcrypt.genSalt(10);
    securedPassword = await bcrypt.hash(password, salt);

    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists." });
    }
    user = await User.create({
      name,
      email,
      password: securedPassword,
      avatar: {
        publicID: myCloud.public_id,
        url: myCloud.secure_url,
      },
    });

    sendToken(user, 201, res);
 }catch(err){
  res.status(500).json({
    success:false,
    message:err.message
  })
 }
};

//login user
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //check if both email and password have been entered or not

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({success: false, message: "Invalid credentials" });
    }

    const enteredPassword = await bcrypt.compare(password, user.password);
    if (!enteredPassword) {
      return res.status(400).json({success: false, message: "Invalid credentials" });
      // return next(new ErrorHandler(400,"Invalid credentials"));
    }

    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json("Internal server error");
  }
};

// log out

const logoutUser = async (req, res) => {
  try{res.cookie("authToken", null, {
    expires: new Date(Date.now()), //expiring the current token value
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
}
catch (err) {
  res.status(500).json({success:false, message:"Internal server error"});
}
};

//forgot password
const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({success:false, message:"No such user exists."});
    }

    //Get the resetToken
    const resetToken = user.genResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetPasswordurl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

    //actual-> ... but due to port differences just for temporary use
    // const resetPasswordurl = `${req.protocol}://${req.get(
    //   "host"
    // )}/api/users/password/reset/${resetToken}`;


    const message = `Click on this link to reset your password \n\n ${resetPasswordurl} \n\n Please ignore if the above request was not made by you.`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Recovery",
        message,
      });
      // console.log(user.name);
      res.status(200).json({
        success: true,
        message: `Email sent to ${user.email}`,
        user,
      });
    } catch (err) {
      this.resetPasswordToken = undefined;
      this.resetPasswordExpiry = undefined;

      await user.save({ validateBeforeSave: false });
      // console.log(err.message);
      return res.status(500).json({success:false, message:err.message});
    }
  } catch (err) {
    res.status(500).json({success:false, message:err.message});
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const resetPasswordTokens = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    const user = await User.findOne({
      resetPasswordToken: resetPasswordTokens,
      resetPasswordExpiry: { $gt: Date.now() },
    });
    // console.log(resetPasswordTokens);

    if (!user) {
      return res.status(400).json({success:false, message:"Token expired. Please try again"});
    }

    if (req.body.password !== req.body.confirmPassword) {
      return res.status(400).json({success:false, message:"Passwords didn't match!"});
    }
    // console.log(user);
    const salt = await bcrypt.genSalt(10);
    securedPassword = await bcrypt.hash(req.body.password, salt);
    user.password = securedPassword;
    //   console.log(user.password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    // console.log(user);

    await user.save();
    // console.log(user.password);

    //login again
    // sendToken(user, 200, res);
    return res.status(200).json({
      success: true,
      user,
    });

  } catch (err) {
    res.status(500).json({success:false, message:err.message});
  }
};

//get user details

const getUserDetails = async (req, res) => {
  try{
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
}catch (err) {
  res.status(500).json({success:false,message:"Internal server error"});
}
};

//update user password after logging in

const updatePassword = async (req, res) => {
  try{
    const user = await User.findById(req.user.id).select("+password");

    // console.log(user.password);
    const enteredPassword = await bcrypt.compare(req.body.oldpassword, user.password);
    if (!enteredPassword) {
      return res.status(400).json({success:false, message: "Old password is incorrect." });
    }

    if(req.body.newpassword!==req.body.confirmnewpassword){
        return res.status(400).json({success:false,message:"Passwords didn't match!"});
    }

    const salt = await bcrypt.genSalt(10);
    securedPassword = await bcrypt.hash(req.body.newpassword, salt);
    user.password = securedPassword;

    await user.save();
    sendToken(user, 200, res); 
  }catch (err) {
    res.status(500).json({success:false, message:err.msg});
  }
 
  };
  
  //update user details
  const changeUserDetails=async(req,res,next)=>{
    try{
    const userData={
        name:req.body.name,
        email:req.body.email
           
    }
    // console.log(req.body.avatar);
    if(req.body.avatar !== ""){
      const user= await User.findById(req.user.id);
      const imgID=user.avatar.publicID;
      await cloudinary.v2.uploader.destroy(imgID);
        // console.log("jhkdhu");
      const myCloud=await cloudinary.v2.uploader.upload(req.body.avatar,{
        folder:"avatars",
        width:150,
        crop:"scale"
      });

      userData.avatar={
        publicID:myCloud.public_id,
        url:myCloud.secure_url
      }
    }

    const user= await User.findByIdAndUpdate(req.user.id,userData,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    });

    res.status(200).json({
        success: true,
        
      });
    }catch (err) {
      // console.log(err.message);
      res.status(500).json({success:false,message:err.message});

    }
  }

  // ADMIN route get all users
  const getAllUsers=async(req,res)=>{
    try{
      const users=await User.find();
      res.status(200).json({
        success:true,
        users
      })
    }catch (err) {
      res.status(500).json({message:err.message});
    }
  }
  // ADMIN route get a single user
  const getSingleUserDetails=async(req,res)=>{
    try{
      const user=await User.findById(req.params.id);

      if(!user){
       return res.status(404).json({message:`No user exists with id: ${req.params.id}`})
      }
      res.status(200).json({
        success:true,
        user
      })
    }catch (err) {
      res.status(500).json({message:"Internal server error"});
    }
  }

  //ADMIN- update user role
  const updateUserRole=async(req,res)=>{
    try{
    const userData={
        name:req.body.name,
        email:req.body.email,
        role:req.body.role

    };
    let user=await User.findById(req.params.id);
    if(!user){
      return res.status(404).json({message:`No user exists with id: ${req.params.id}`});
    }

     user= await User.findByIdAndUpdate(req.params.id,userData,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    });
    // console.log(user);

    res.status(200).json({
        success: true,
        user,
      });
    }catch (err) {
      res.status(500).json({
        success:false,
        message:err.message
      });
    }
  }

  //ADMIN - delete user
  const deleteUser=async(req,res)=>{
    try{
    const user= await User.findById(req.params.id);
    if(!user){
      return res.status(404).json({message:`No user exists with id: ${req.params.id}`});
    }
    //removing from cloudinary
    const imgID=user.avatar.publicID;
    await cloudinary.v2.uploader.destroy(imgID);

    await user.remove();

    res.status(200).json({
        success: true,
        message:"User deleted successfully"
      });
    }catch (err) {
      res.status(500).json({message:"Internal server error"});
    }
  }

module.exports = {
  signupUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  getUserDetails,
  updatePassword,
  changeUserDetails,
  getAllUsers,
  getSingleUserDetails,
  updateUserRole,
  deleteUser
};
