const mongoose=require ("mongoose");
const {Schema}=mongoose;
const validator=require("validator");
const crypto=require('crypto')
const userSchema=new Schema({
    name:{
        type:String,
        required:[true, "Please enter your name."],
        maxLength:[30,"Name cannot exceed 30 characters"],
        minLength:[4, "Name should have atleast 4 characters"]
    },
    email:{
        type:String,
        required:[true, "Please enter your email."],
        unique:true,
        validate:[validator.isEmail, "Please enter a valid email"]
        
    },
    password:{
        type:String,
        required:[true, "Please enter your Password."],
        minLength:[8, "Password should have atleast 8 characters"],
        select:false
        
    },
    avatar:{
        publicID:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },
    role:{
        type:String,
        default:"user"
    },
    resetPasswordToken:String,
    resetPasswordExpiry:Date
});

//reset password functionality
userSchema.methods.genResetPasswordToken = function(){
    //generating token
    const resetToken=crypto.randomBytes(20).toString("hex");

    //hashing and adding this token to the schema
    this.resetPasswordToken=crypto.createHash("sha256").update(resetToken).digest("hex");

    this.resetPasswordExpiry=Date.now()+10*60*1000;  //15 minutes

    return resetToken;
}

module.exports=new mongoose.model("User", userSchema);