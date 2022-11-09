const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

// Middlewares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@simple-node-app.ybb3hyi.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

const run = async () => {
  try {
    const database = client.db("astutePhotography");
    const colletion = database.collection("services");
    const reviewsColletion = database.collection("reviews");

    app.get("/servicesLimit", async (req, res) => {
      const result = colletion.find({});
      const data = await result.limit(3).toArray();
      res.send(data);
    });

    app.get("/services", async (req, res) => {
      const result = colletion.find({});
      const data = await result.toArray();
      res.send(data);
    });

    app.post("/services", async (req, res) => {
      const data = req.body;
      await colletion.insertOne(data);
      res.send(data);
    });

    app.get("/reviews", async (req, res) => {
      const result = reviewsColletion.find({});
      const data = await result.toArray();
      res.send(data);
    });

    app.post("/reviews", async (req, res) => {
      const data = req.body;
      await reviewsColletion.insertOne(data);
      res.send(data);
    });

    app.delete("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewsColletion.deleteOne(query);
      res.send(result);
    });
  } catch (err) {
    console.log(err);
  }
};

run().catch((err) => {
  console.log(err);
});

app.get("/", (req, res) => {
  res.send("This is an api");
});

app.listen(port);
