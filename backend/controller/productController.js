const Product = require("../models/productModel");
// const ErrorHandler = require("../utils/errorHandler");
const Features = require("../utils/features");
const cloudinary = require("cloudinary")

//add product - ADMIN
const createProduct = async (req, res, next) => {
  try {
    const myCloud=await cloudinary.v2.uploader.upload(req.body.images,{
      folder:"Products",
      width:150,
      crop:"scale"
    });

    req.body.images={
      
        publicID: myCloud.public_id,
        url: myCloud.secure_url,
      
    }
    //in the products model this will store the value of user id that will bw obtained from the isAuthenticates function that will be executed before createProduct
    req.body.user = req.user.id;

    const product = await Product.create(req.body);
    res.status(201).json({
      success: true,
      product,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

//get all products
const getAllProdcuts = async (req, res) => {
  // return res.status(500).json({
  //   success: false,
  //     message: "ERROR generated",
  // })
  try {
    const productsPerPage = 9;
    const productsCount = await Product.countDocuments();

    const features = new Features(Product.find(), req.query)
      .search()
      .filter()

    let allProducts = await features.query;

    let filteredCount=allProducts.length;

    features.pagination(productsPerPage);
    // console.log("sd");

     allProducts = await features.query.clone();

    res.status(200).json({
      success: true,
      allProducts,
      productsCount,
      productsPerPage,
      filteredCount
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

//update product- ADMIN
const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      console.log("not found");
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
      // return next(new ErrorHandler(404,"Product not found"));
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
    // console.log("updated");
    res.status(200).json({
      success: true,
      product,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

//delete product -ADMIN
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    //removing image
    const imgID=product.images.publicID;
      await cloudinary.v2.uploader.destroy(imgID);

    await product.remove();
    res.status(200).json({
      success: true,
      message: "Product has been deleted successfully",
    });
  }catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

//details of a single product
const getProductDetails = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
      // return next(new ErrorHandler(404,"Product not found"));
    }
    res.status(200).json({
      success: true,
      product,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

//Reviews- creating and updating
const createReviews = async (req, res, next) => {
  try {
    const { rating, comment, productId } = req.body;

    const review = {
      userId: req.user._id,
      userName: req.user.name,
      rating: Number(rating),
      comment,
    };
    const product = await Product.findById(productId);
    const isReviewed = product.reviews.find(
      (r) => r.userId.toString() === req.user._id.toString()
    );

    //updating existing review
    if (isReviewed) {
      product.reviews.forEach((r) => {
        if (r.userId.toString() === req.user._id.toString()) {
          (r.rating = rating), (r.comment = comment);
        }
      });
    } else {
      product.reviews.push(review);
      product.numberOfReviews = product.reviews.length;
    }
    let avg = 0;
    product.reviews.forEach((r) => {
      avg += r.rating;
    });
    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Review added",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

//getting all reviews of a particular product
const getReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.query.id);

    if (!product) {
      return res.status(404).json("Product not found");
    }
    
    res.status(200).json({
      success: true,
      reviews: product.reviews,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

//deleting reviews
const deleteReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.query.productId);

    if (!product) {
      return res
        .status(404)
        .json("Product not found");
    }

    // const user_id=product.reviews.find((r)=>r._id.toString===req.query.id.toString());
    // console.log(user_id);
    // if(req.user.id.toString()!==user_id){
    //     return res.status(401).json("Not allowed");
    // }
    const reviews = product.reviews.filter(
      (r) => r._id.toString() !== req.query.id.toString()
    );
    let avg = 0;
    reviews.forEach((r) => {
      avg += r.rating;
    });
    ratings = avg / reviews.length;

    numberOfReviews=reviews.length; 
    
    await Product.findByIdAndUpdate(req.query.productId,
        {
            reviews, numberOfReviews, ratings
        },
        {
            new:true,
            runValidators:true,
            useFindAndModify:false
        }
        )

    res.status(200).json({
      success: true,
      reviews: reviews,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

//get all products --ADMIN
const getProductsAdmin = async (req, res) => {
  
     allProducts = await Product.find()

    res.status(200).json({
      success: true,
      allProducts,
     
    });
  
};
module.exports = {
  getAllProdcuts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetails,
  createReviews,
  getReviews,
  deleteReviews,
  getProductsAdmin
};
