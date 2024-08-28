const { DataTypes } = require('sequelize');
const { sequelize} = require('../config/db');
const User = require('./User');

const Product = sequelize.define('products',{

    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    price: {
       type: DataTypes.DECIMAL(10, 2),
       allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: sequelize.models.User,
        key: "id"
      },
      unique: 'compositeIndex'
      
    },
    date_added: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('NOW()')
    },
    date_modified: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    },

    image_data: {
      type: DataTypes.BLOB('long'),
      allowNull: true,
      defaultValue: null
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 1.00
    },
    banned: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
   

},{
   timestamps: false
}
);

Product.belongsTo(User, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE'
});


module.exports = Product;