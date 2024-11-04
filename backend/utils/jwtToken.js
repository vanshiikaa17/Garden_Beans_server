const jwt=require("jsonwebtoken");

const sendToken=(user, statusCode, res)=>{
    const authToken=jwt.sign({id:user._id}, process.env.JWT_SECRET, {  //merging our secret key and the id of user 
        expiresIn:process.env.JWT_EXPIRY
      });

      //options for cookie
      const options={
        expires:new Date(
            Date.now()+process.env.COOKIE_EXPIRE*24*60*60*1000
),
        // httpOnly:true
        secure:true,
        sameSite:strict
      };

      res.status(statusCode).cookie("authToken", authToken, options).json({
        success:true,
        authToken,
        user
    });

}
module.exports=sendToken;