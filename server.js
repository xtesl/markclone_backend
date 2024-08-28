//configure environment variables
require('dotenv').config();
const errorHandler = require('./middlewares/error');

const express = require('express');
const cors = require('cors');
const auth_router = require('./routes/auth');
const product_router = require('./routes/products');
//const cart_router = require('./routes/cart');
const user_router = require('./routes/users');
const { initializeDatabase } = require('./config/db');
const helpers = require('./utils/helpers');




initializeDatabase().then(()=>{
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({extended: false}));
  app.get('/hello', (req, res)=>{
    res.send('Immanauel');
  });
  app.use('/api/v1', auth_router, product_router, user_router);

  app.use(errorHandler);

  
  const PORT = process.env.PORT || 4000;
  
  //set server to listen to requests
  app.listen(PORT, process.env.IP_ADDRESS, async function(){
      console.log('SERVER IS RUNNING...');
      
  });

});



