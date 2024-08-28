const CONSTANTS = require('../utils/constants');
const Redis = require('ioredis');
const Product = require('../models/Product'); 
const asyncHandler = require('express-async-handler');
const { promisify } = require('util');

const client = new Redis(
   {
   host: 'localhost', 
    port: 6379, 
   }
);
const getAsync = promisify(client.get).bind(client);
const setexAsync = promisify(client.setex).bind(client); 

const productListingCache = asyncHandler(async(req, res, next)=>{
    const { category_id, page } = req.body;
    const key = `product_listing:${category_id}:${page}`;

    try{
       const cachedData = await getAsync(key);
       if(cachedData){
         const parsedData = JSON.parse(cachedData);
         res.json(parsedData);
         return;
       }
       const products = await Product.findProductByCategory(category_id);
       await setexAsync(key, CONSTANTS.REFRESH_TOKEN_DURATION, JSON.stringify(products));
       res.json({products});
    }catch(err){
      res.status(500).json({
         message:"Internal Server Error"
      });
    }
});

module.exports = { productListingCache };