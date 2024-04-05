const { gql } = require("apollo-server");

module.exports = gql`
  type User {
    id: ID!
    firstName: String
    lastName: String
    phoneNumber: String
    password: String
    cart: [String]
    orders: [String]
  }

  type Product {
    id: ID!
    title: String
    description: String
    price: Int
    category: String
    images: [String]
    rating: Float
  }

  input UserInput {
    firstName: String!
    lastName: String!
    phoneNumber: String!
    password: String!
  }
  type loginPayload {
    ok: Boolean
    message: String

    token: String!
    userName: String!
  }
  type returnPayload {
    ok: Boolean
    message: String
  }

  type Query {
    # user(ID: ID!): User!
    fetchProducts(
      category: String
      rating: String # price: String
      filter: String
    ): [Product!]!
    product(id: ID!): Product!
    userCartItems(phoneNumber: String!): [String!]!
    userOrders(phoneNumber: String!): [String!]!
  }

  type Mutation {
    addUser(input: UserInput!): returnPayload!
    loginUser(phoneNumber: String, password: String): loginPayload!
    AddToCart(productId: ID!, phoneNumber: String!): returnPayload!
    deleteFromCart(productId: ID!, phoneNumber: String!): returnPayload!
    placeOrder(phoneNumber: String!): returnPayload!
  }
`;
