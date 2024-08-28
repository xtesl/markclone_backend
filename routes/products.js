const { create, update, _delete, fetch_products } = require('../contollers/products');
const products_router = require('express').Router();
const { verifyToken  } = require('../middlewares/auth');
// const cache = require('../middlewares/cache');



//products routes
products_router.route('/products/new').post(verifyToken, create);
products_router.route('/products').get(fetch_products);
products_router.route('/products/delete/:id').delete(verifyToken, _delete);
products_router.route('/products/update/:id').put(verifyToken, update);
// products_router.route('/products/get/category').get(cache.productListingCache,
// product_contollers.get_product_by_category);

module.exports = products_router;