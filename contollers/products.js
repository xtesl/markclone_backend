/**
 * @file product-controller.js
 * @description Controller functions for managing products.
 * @version 1.0.0
 * 
 * @overview
 * This file contains controller functions for product management, including creation, update, and deletion. 
 * The logic in these functions is designed to allow sellers to interact with products based on their authorization.
 * 
 * @author
 * Markclone <aimmanuel925@gmail.com>
 * 
 * @license
 * This code is confidential and proprietary to Markclone. Unauthorized distribution or reproduction without
 * express permission from Markclone is prohibited.
 * 
 * For inquiries, please contact aimmanuel925@gmail.com.
 */

const Product = require('../models/Product');
const asyncHandler = require('express-async-handler');
const helpers = require('../utils/helpers');

/*
  Create Product
*/

/**
 * @function create
 * @description Controller function for creating a new product.
 * @async
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 * @returns {void}
 */
const create = asyncHandler(async (req, res, next) => {
    const { name, description, price, quantity, category_id } = req.body;
    const data = [name, description, price, quantity, category_id];
    const status = await helpers.validateNumberOfValues(data, 5, res);
    if(status == -1) return;
  
    const user = req?.user; // The user in session
    try{
      // Create new product for the verified user in session
      if(user){
      req.body.user_id = user.id
      const product = await Product.create(req.body);
      res.json(product);
      }else res.json({ message: "Something went wrong!"});
    }catch(error){
        throw new Error(error.message);
    }
});



/*
  Update Product
*/

/**
 * @function update
 * @description Controller function for updating product details.
 * @async
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 * @returns {void}
 */
const update = asyncHandler(async (req, res, next) => {
    // Fields that can be updated excluding category_id, can't change product category.
    // User should create a new product instead.
    const user = req?.user;
    const updates = req.body;
    try {
        if(user){
          const productId = parseInt(req.params.id);
          const product = await Product.findByPk(productId);
          let canUpdate = product ? product.user_id == user.id : undefined;
          if(!canUpdate){
            return res.status(401).json(
                { responseStatus: 'failed', reason: 
                'Product might not exist or user can\'t edit the product'
            });
          }
          Object.keys(updates).forEach((key)=>{
                 if(product[key] !== undefined) product[key] = updates[key];
             });
        product['date_modified'] = await helpers.getTimestamp();
        await product.save();
        return res.json({ responseStatus: 'Ok' });
        }
    } catch (err) {
        res.status(500).json({ message: "Something went wrong!" });
    }
});



/*
  Delete Product
*/

/**
 * @function delete
 * @description Controller function for deleting a product from the platform.
 * @async
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 * @returns {void}
 */
const _delete = asyncHandler(async (req, res, next) => {

    const productId = parseInt(req.params.id);
    const user = req?.user; // User in session who wants to perform the operation

    try {
         if(user){
         // Find the product in the db by id
         const product = await Product.findByPk(productId);
         let canDelete = product ? product.user_id == user.id : undefined;
         if(!canDelete){
            return res.status(401).json(
                { responseStatus: 'failed', reason: 
                'Product might not exist or user can\'t edit the product'
            });
         }
        //delete product
         await product.destroy();
         return res.json({ message: "Product deleted successfully" });
         }else throw new Error("user not in session");
    } catch (err) {
        res.status(500).json({ message: "Something went wrong" });
    }
});



/*
  fetch products
*/

/**
 * @function fetch_products
 * @description Controller function for fetching products.
 * @async
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 * @returns {void}
 */

const fetch_products = asyncHandler(async(req, res, next) => {
    try{
      const products = await Product.findAll();
      res.json(products);
    }catch(err){
       throw err;
    }
});

module.exports = { update, create, _delete, fetch_products };


// /**
//  * @function get_product_by_category
//  * @description Controller function for querying product based on categories.
//  * @async
//  * @param {object} req - Express request object.
//  * @param {object} res - Express response object.
//  * @param {function} next - Express next middleware function.
//  * @returns {void}
//  * @useCase designed for front-end system call not for search queries
//  */
// exports.get_product_by_category = asyncHandler(async(req, res, next)=>{
//    const { category_id } = req.body;
//    const status = await helpers.validateNumberOfValues([category_id], 1, res);
//    if(status == -1) return;
   
//    try{
//      const products = await Product.findProductByCategory(category_id);
//      res.json({products:products});
//    }catch(err){
//       next(err);
//    }

// });