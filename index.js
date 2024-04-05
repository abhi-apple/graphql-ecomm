const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const mongoose = require("mongoose");

const express = require("express");
const cors = require("cors");

const app = express();
const MONGODB =
  "mongodb+srv://abhinay:Abhi1890@ecomknol.lhbp5z0.mongodb.net/?retryWrites=true&w=majority";

const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const PORT = process.env.PORT || 4000;

async function startApolloServer() {
  await server
    .start()
    .then(
      console.log(`🚀 Apollo Server ready at http://localhost:4000/graphql`)
    );

  app.use(
    "/graphql",
    cors(),
    express.json(),
    express.urlencoded({ extended: true }),
    expressMiddleware(server, {
      context: async ({ req }) => ({ token: req.headers.token }),
    })
  );
  mongoose
    .connect(MONGODB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((error) => {
      console.error("MongoDB connection error:", error);
    });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startApolloServer();
