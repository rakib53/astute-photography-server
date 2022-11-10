const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");

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

    const jswToken = (req, res, next) => {
      const authUser = req.headers.authorization;
      if (!authUser) {
        return res.status(401).send({ message: "UnAuthorized access" });
      }

      const token = authUser.split(" ")[1];
      jwt.verify(token, process.env.JWT_TOKEN, function (err, decode) {
        if (err) {
          return res.status(401).send({ message: "UnAuthorized access" });
        }

        req.decoded = decode;
        next();
      });
    };

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.JWT_TOKEN, {
        expiresIn: "120d",
      });
      res.send({ token });
    });

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

    app.get("/reviews", jswToken, async (req, res) => {
      const result = reviewsColletion.find({});
      const review = await result.toArray();
      const sortedReview = review.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      res.send(sortedReview);
    });

    app.get("/reviewsPublic", async (req, res) => {
      const result = reviewsColletion.find({});
      const review = await result.toArray();
      const sortedReview = review.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      res.send(sortedReview);
    });

    app.post("/reviews", async (req, res) => {
      const data = req.body;
      await reviewsColletion.insertOne(data);
      res.send(data);
    });
    app.put("/reviews/:id", async (req, res) => {
      const data = req.body;
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          review: data.review,
          rating: data.rating,
        },
      };
      const result = await reviewsColletion.updateOne(filter, updateDoc);
      res.send(result);
      console.log(data);
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
