const User = require("../models/User");
const Product = require("../models/Product");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
// const bcrypt = require("bcryptjs");

module.exports = {
  Query: {
    async fetchProducts(_, { category, rating, filter }) {
      try {
        const query = {};
        if (category) {
          query.category = category;
        }
        if (rating) {
          let minRating;
          switch (rating) {
            case "Above 4.5 rating":
              minRating = 4.5;
              break;
            case "Above 4 rating":
              minRating = 4;
              break;
            case "Above 3.5 rating":
              minRating = 3.5;
              break;
            default:
              minRating = 0;
          }
          query.rating = { $gte: minRating };
        }

        let sort = {};
        switch (filter) {
          case "Price high to low":
            sort.price = -1;
            break;
          case "Price low to high":
            sort.price = 1;
            break;
          case "Average customer ratings":
            sort.rating = -1;
            break;
          default:
            sort = { createdAt: -1 };
        }

        const products = await Product.find(query).sort(sort);

        return products;
      } catch (error) {
        console.error("Error getting products:", error);
        throw new Error("Internal server error");
      }
    },
    async product(_, { id }) {
      try {
        const product = await Product.findById(id);
        return product;
      } catch (error) {
        console.error("Error getting product:", error);
        throw new Error("Internal server error");
      }
    },
    async userCartItems(_, { phoneNumber }) {
      let user = await User.findOne({ phoneNumber });

      return user.cart;
    },
    async userOrders(_, { phoneNumber }) {
      let user = await User.findOne({ phoneNumber });
      return user.orders;
    },
  },
  Mutation: {
    async addUser(_, { input }) {
      try {
        const { firstName, lastName, phoneNumber, password } = req.body;

        const existingUser = await User.findOne({ phoneNumber });
        if (existingUser) {
          return { ok: false, message: "Phone Number is already registered" };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
          firstName,
          lastName,
          phoneNumber,
          password: hashedPassword,
        });
        await newUser.save();

        res.status(201).json({
          ok: true,
          message: "User registered successfully",
          user: newUser,
        });
      } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ ok: false, message: "Internal server error" });
      }
    },
    async loginUser(_, { phoneNumber, password }) {
      try {
        const user = await User.findOne({ phoneNumber });
        if (!user) {
          return { ok: false, message: "Invalid phone number or password" };
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return { ok: false, message: "Invalid phone number or password" };
        }

        const token = jwt.sign(
          { userId: user._id, phoneNumber: user.phoneNumber },
          "knolskape",
          { expiresIn: "6h" }
        );
        const userName = user.firstName;

        // Return only necessary data, avoiding circular references
        return {
          ok: true,
          message: "Login successful",
          token,
          userName,
        };
      } catch (error) {
        console.error("Error logging in:", error);
        return { ok: false, message: "Internal server error" };
      }
    },

    async AddToCart(_, { productId, phoneNumber }) {
      try {
        const user = await User.findOne({ phoneNumber });

        if (!user.cart.includes(productId)) {
          user.cart.push(productId);
          await user.save();
          return {
            ok: true,
            message: "Product added to cart successfully",
          };
        } else {
          return { ok: false, message: "Item already in cart" };
        }
      } catch (error) {
        console.error("Error adding product to cart:", error);
        return { ok: false, message: "Internal server error" };
      }
    },
    async deleteFromCart(_, { productId, phoneNumber }) {
      try {
        // if (!user) {
        //   throw new Error("User not authenticated");
        // }

        // user.cart = user.cart.filter((item) => item !== productId);
        // await user.save();
        // return { ok: true, message: "Product removed from cart" };
        const user = await User.findOne({ phoneNumber });
        const index = user.cart.indexOf(productId);
        console.log(phoneNumber);

        if (index > -1) {
          user.cart.splice(index, 1);
        }

        await user.save();
        return "Deleted successfully!";
      } catch (error) {
        console.error("Error removing product from cart:", error);
        return { ok: false, message: "Internal server error" };
      }
    },
    async placeOrder(_, { phoneNumber }) {
      try {
        // if (!user) {
        //   throw new Error("User not authenticated");
        // }

        // const cartItems = user.cart;
        // user.orders.unshift(...cartItems);
        // user.cart = [];

        // await user.save();
        // return { ok: true, message: "Order placed successfully" };
        const user = await User.findOne({ phoneNumber });
        user.orders.push(...user.cart);
        user.cart = [];
        await user.save();
        return "Order placed successfully!";
      } catch (error) {
        console.error("Error placing order:", error);
        return { ok: false, message: "Internal server error" };
      }
    },
  },
};
