const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// midleware
app.use(cors());
app.use(express.json());

// Create a get api
app.get("/", (req, res) => {
  res.send("Api done");
});

const uri =
  "mongodb+srv://mongodbUser:hSMFLPo6zrAqzr8w@cluster0.6plls.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const productCollection = client.db("storedBike").collection("product");
    let obj = { name: "rasel", age: 21 };
    const result = await productCollection.insertOne(obj);
    app.get("/product", (req, res) => {
      res.send(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port);
