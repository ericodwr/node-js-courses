const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

class User {
  constructor(username, email, cart, id) {
    this.username = username;
    this.email = email;
    this.cart = cart;
    this._id = id;
  }

  save() {
    const db = getDb();

    return db.collection('users').insertOne(this);
  }

  addToCart(product) {
    const cartProductIndex = this.cart.items.findIndex((cp) => {
      return cp.productId.toString() === product._id.toString();
    });

    let newQuantity = 1;
    const cartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
      newQuantity = cartItems[cartProductIndex].quantity + 1;
      cartItems[cartProductIndex].quantity = newQuantity;
    } else {
      cartItems.push({
        productId: new mongodb.ObjectId(product._id),
        quantity: newQuantity,
      });
    }

    const db = getDb();
    return db
      .collection('users')
      .updateOne(
        { _id: new mongodb.ObjectId(this._id) },
        { $set: { cart: { items: cartItems } } },
      );
  }

  getCart() {
    const db = getDb();

    const productIds = this.cart.items.map((i) => i.productId);
    return db
      .collection('products')
      .find({ _id: { $in: productIds } })
      .toArray()
      .then((products) =>
        products.map((p) => {
          return {
            ...p,
            quantity: this.cart.items.find(
              (item) => item.productId.toString() === p._id.toString(),
            ).quantity,
          };
        }),
      );
  }

  deleteItemFromCart(productId) {
    const updatedCartItems = this.cart.items.filter(
      (item) => item.productId.toString() !== productId.toString(),
    );

    const db = getDb();
    return db
      .collection('users')
      .updateOne(
        { _id: new mongodb.ObjectId(this._id) },
        { $set: { cart: { items: updatedCartItems } } },
      );
  }

  addOrder() {
    const db = getDb();

    return this.getCart().then((products) => {
      const order = {
        products,
        user: { id: this._id, username: this.username },
      };
      return db
        .collection('orders')
        .insertOne(order)
        .then((res) => {
          this.cart = [];
          return db
            .collection('users')
            .updateOne(
              { _id: new mongodb.ObjectId(this._id) },
              { $set: { cart: { items: [] } } },
            );
        })
        .catch((err) => console.log(err));
    });
  }

  getOrders() {
    const db = getDb();

    return db
      .collection('orders')
      .find({ 'user.id': new mongodb.ObjectId(this._id) })
      .toArray();
  }

  static findById(id) {
    const db = getDb();

    return db
      .collection('users')
      .findOne({ _id: new mongodb.ObjectId(id) })
      .then((res) => {
        return res;
      })
      .catch((err) => console.log(err));
  }
}

module.exports = User;
