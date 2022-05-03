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

    app.get("/product", async (req, res) => {
      const pages = parseInt(req.query.page);
      console.log(pages);
      const query = {};
      const cursor = productCollection.find(query);
      if (pages === 1) {
        let result = await cursor.limit(2).toArray();
        res.send(result);
      }
      if (pages > 1) {
        let result = await cursor.skip(pages).limit(2).toArray();
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
      res.send(accessToken);
    });
    // find product
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
    // Add product in database
    app.post("/product", async (req, res) => {
      const newProduct = req.body;
      console.log(newProduct);
      const result = await productCollection.insertOne(newProduct);
      res.send(result);
    });
    // Delete a single productsh
    app.delete("/product/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      if (result.deletedCount === 1) {
        res.send(result);
      }
    });
    // Product count for pagination
    app.get("/productCount", async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const count = await cursor.count();
      res.send({ count });
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port);
