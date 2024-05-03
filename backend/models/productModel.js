const mongoose=require ("mongoose");
const {Schema}=mongoose;
const productSchema=new Schema({
    name:{
        type:String,
        required:[true,"Please enter product name"],
        trim:true
    },
    description:{
        type:String,
        required:[true,"Please enter product description"]
    },
    price:{
        type:Number,
        required:[true,"Please enter product price"],
        // maxLength:[8,"Price cannot exceed 8 characters"]
    },
    //average rating
    ratings:{
        type:Number,
        default:0
    },
    images:{
        publicID:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    },
    category:{
        type:String,
        required:[true, "Please enter the category"]
    },
    stock:{
        type:Number,
        required:[true, "Please enter the stock of the product"],
        maxLength:[4,"Stock cannot exceed 4 characters"],
        default:1
    },
    numberOfReviews:{
        type:Number,
        default:0
    },
    reviews:[
        {
            userId:{
                type:mongoose.Schema.ObjectId, 
                ref:"User",
                req:true
            },
            userName:{
                type:String,
                required:true
            },
            //rating by a specific user
            rating:{
                type:Number,
                required:true
            },
            comment:{
                type:String,
                required:true
            }
        }
    ],
    dateCreated:{
        type:Date,
        default:Date.now
    },
    user:{
        type:mongoose.Schema.ObjectId, 
        ref:"User",
        req:true
    }
})
module.exports=new mongoose.model("Product", productSchema);