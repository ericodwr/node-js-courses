const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  cart: {
    items: [
      {
        prodId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.prodId.toString() === product._id.toString();
  });

  let newQuantity = 1;
  const cartItems = [...this.cart.items];
  if (cartProductIndex >= 0) {
    newQuantity = cartItems[cartProductIndex].quantity + 1;
    cartItems[cartProductIndex].quantity = newQuantity;
  } else {
    cartItems.push({
      prodId: product._id,
      quantity: newQuantity,
    });
  }

  const updatedCart = {
    items: cartItems,
  };

  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.removeFromCart = function (productId) {
  const updatedCartItems = this.cart.items.filter(
    (item) => item.prodId.toString() !== productId.toString(),
  );

  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
