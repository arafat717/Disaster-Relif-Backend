const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({ Credential: true }));
app.use(express.json());

// MongoDB Connection URL
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("assignment");
    const collection = db.collection("users");

    // User Registration
    app.post("/api/v1/register", async (req, res) => {
      const { name, email, password } = req.body;

      // Check if email already exists
      const existingUser = await collection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user into the database
      await collection.insertOne({ name, email, password: hashedPassword });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
      });
    });

    // User Login
    app.post("/api/v1/login", async (req, res) => {
      const { email, password } = req.body;

      // Find user by email
      const user = await collection.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Compare hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
        expiresIn: process.env.EXPIRES_IN,
      });

      res.json({
        success: true,
        message: "Login successful",
        token,
      });
    });

    app.get("/api/v1/users", async (req, res) => {
      const result = await collection.find().toArray();
      res.send(result);
    });

    // ==============================================================
    // WRITE YOUR CODE HERE
    // ==============================================================

    const donationCollection = client
      .db("disater-db")
      .collection("all-disaster");

    const donersCollection = client.db("disater-db").collection("donars");
    const communityCollection = client.db("disater-db").collection("community");
    const volunteerCollection = client.db("disater-db").collection("volunteer");
    const testominalCollection = client
      .db("disater-db")
      .collection("testominal");

    //   get all donations
    app.get("/api/v1/donations", async (req, res) => {
      const result = await donationCollection.find().toArray();
      res.send(result);
    });

    app.get("/api/v1/donations/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await donationCollection.findOne(query);
      res.send(result);
    });

    // POST route to add a new donation
    app.post("/api/v1/donations", async (req, res) => {
      try {
        const newDonation = req.body;
        const result = await donationCollection.insertOne(newDonation);
        // res.status(201).send(result.ops[0]);
        res.send(result);
      } catch (error) {
        console.error("Error occurred while adding donation:", error);
        res.status(500).send("Error occurred while adding donation");
      }
    });

    app.delete("/api/v1/donations/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await donationCollection.deleteOne(query);
        if (result.deletedCount === 1) {
          res.status(204).send();
        } else {
          res.status(404).send("Donation not found");
        }
      } catch (error) {
        console.error("Error occurred while deleting donation:", error);
        res.status(500).send("Error occurred while deleting donation");
      }
    });

    app.put("/api/v1/donations/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const updatedData = req.body;

        const result = await donationCollection.updateOne(query, {
          $set: updatedData,
        });

        if (result.modifiedCount === 1) {
          res.status(200).send("Donation updated successfully");
        } else {
          res.status(404).send("Donation not found");
        }
      } catch (error) {
        console.error("Error occurred while updating donation:", error);
        res.status(500).send("Error occurred while updating donation");
      }
    });

    //   get all donations
    app.get("/api/v1/doners", async (req, res) => {
      const result = await donersCollection
        .find()
        .sort({ amount: -1 })
        .toArray();
      res.send(result);
    });

    // community apis

    app.post("/api/v1/community", async (req, res) => {
      try {
        const newComment = req.body;
        const result = await communityCollection.insertOne(newComment);
        // res.status(201).send(result.ops[0]);
        res.send(result);
      } catch (error) {
        console.error("Error occurred while adding donation:", error);
        res.status(500).send("Error occurred while adding donation");
      }
    });

    app.get("/api/v1/community", async (req, res) => {
      const result = await communityCollection
        .find()
        .sort({ timestamp: -1 })
        .toArray();
      res.send(result);
    });

    app.post("/api/v1/volunteer", async (req, res) => {
      try {
        const volunteer = req.body;
        const result = await volunteerCollection.insertOne(volunteer);
        // res.status(201).send(result.ops[0]);
        res.send(result);
      } catch (error) {
        console.error("Error occurred while adding donation:", error);
        res.status(500).send("Error occurred while adding donation");
      }
    });

    app.get("/api/v1/volunteer", async (req, res) => {
      const result = await volunteerCollection.find().toArray();
      res.send(result);
    });

    app.post("/api/v1/testominal", async (req, res) => {
      try {
        const volunteer = req.body;
        const result = await testominalCollection.insertOne(volunteer);
        // res.status(201).send(result.ops[0]);
        res.send(result);
      } catch (error) {
        console.error("Error occurred while adding donation:", error);
        res.status(500).send("Error occurred while adding donation");
      }
    });

    app.get("/api/v1/testominal", async (req, res) => {
      const result = await testominalCollection.find().toArray();
      res.send(result);
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } finally {
  }
}

run().catch(console.dir);

// Test route
app.get("/", (req, res) => {
  const serverStatus = {
    message: "Server is running smoothly",
    timestamp: new Date(),
  };
  res.json(serverStatus);
});
