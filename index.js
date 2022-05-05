const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
const app = express();
const port = process.env.PORT || 5000;

// midleware
app.use(cors());
app.use(express.json());

// Verifining jwt token
const verifingToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unAuthorize access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.USER_JWT_TOKEN, (err, decoded) => {
    if (err) return res.status(403).send({ message: "forbidden access" });
    req.decoded = decoded;
    next();
  });
};
// Create a get api
app.get("/", (req, res) => {
  res.send("Api done");
});

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.6plls.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const productCollection = client.db("storedBike").collection("product");
    const userItemsCollection = client.db("storedBike").collection("userItem");
    // const arr=[...productCollection,...userItemsCollection];
    // console.log(productCollection);
    // get all product from database
    app.get("/product", async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      let result = await cursor.toArray();
      res.send(result);
    });
    // manageItem api for manage product paginaton
    app.get("/manageItem", async (req, res) => {
      const pages = parseInt(req.query.page);
      const query = {};
      const cursor = productCollection.find(query);
      let result;
      if (pages === 0) {
        result = await cursor.limit(2).toArray();
      }
      if (pages > 0) {
        result = await cursor
          .skip(pages * 2)
          .limit(2)
          .toArray();
      }
      res.send(result);
    });

    // Product count for pagination
    app.get("/productCount", async (req, res) => {
      const count = await productCollection.estimatedDocumentCount();
      res.send({ count });
    });

    // find a single product by id
    app.get("/product/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });

    // Update quantity
    app.put("/product/:id", async (req, res) => {
      const { id } = req.params;
      const updateQuantity = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          quantity: updateQuantity.quantity,
        },
      };
      const result = await productCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // new item added api
    app.post("/product", async (req, res) => {
      const newProduct = req.body;
      const result = await productCollection.insertOne(newProduct);
      res.send(result);
    });

    // Delete a single products
    app.delete("/product/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      if (result.deletedCount === 1) {
        res.send(result);
      }
    });

    // user added product Api
    app.post("/userItem", async (req, res) => {
      const newItem = req.body;
      const result = await userItemsCollection.insertOne(newItem);
      res.send(result);
    });
    // user all items getting api
    app.get("/userItem", verifingToken, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      if (decodedEmail === email) {
        const query = { email };
        const cursor = userItemsCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      }
    });
    // find user product
    app.get("/userItem/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: ObjectId(id) };
      const result = await userItemsCollection.findOne(query);
      res.send(result);
    });
    // Delete user single products
    app.delete("/userItem/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: ObjectId(id) };
      const result = await userItemsCollection.deleteOne(query);
      if (result.deletedCount === 1) {
        res.send(result);
      }
    });
    // jwt auth
    app.post("/login", async (req, res) => {
      const user = req.body;
      console.log(user);
      const accessToken = jwt.sign(user, process.env.USER_JWT_TOKEN, {
        expiresIn: "1d",
      });
      res.send({ accessToken });
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port);
