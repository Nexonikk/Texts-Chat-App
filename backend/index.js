import express from "express";
import * as dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { WebSocketServer } from "ws";
import userModal from "./models/user.js";
import MessageModal from "./models/message.js";

dotenv.config();
mongoose
  .connect(process.env.MONGODB_URL, {
    serverSelectionTimeoutMS: 60000, // Increase the timeout to 60 seconds
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    console.error("Error details:", err.reason);
  });
const jwtSecret = process.env.JWT_SECRET;
// console.log(process.env.JWT_SECRET);

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({ credentials: true, origin: "https://texts-chat-app.vercel.app" })
);
const User = userModal;
const bcryptSalt = bcrypt.genSaltSync(10);

async function getUserDataFromRequest(req) {
  return new Promise((resolve, reject) => {
    const token = req.cookies?.token;
    if (token) {
      jwt.verify(token, jwtSecret, {}, (err, userData) => {
        if (err) throw err;
        resolve(userData);
      });
    } else {
      reject("no token");
    }
  });
}

app.get("/", (req, res) => {
  res.send("Hiiiiii");
});

app.get("/messages/:userId", async (req, res) => {
  const { userId } = req.params;
  const userData = await getUserDataFromRequest(req);
  const OurUserId = userData.userID;
  const messages = await MessageModal.find({
    sender: { $in: [userId, OurUserId] },
    recipient: { $in: [userId, OurUserId] },
  }).sort({ createdAt: 1 });
  res.json(messages);
});

app.get("/people", async (req, res) => {
  const users = await User.find({}, { _id: 1, username: 1 });
  res.json(users);
});

app.get("/profile", (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    jwt.verify(token, jwtSecret, {}, (err, userData) => {
      if (err) throw err;
      res.json(userData);
      // console.log(userData.userID);
    });
  } else {
    res.status(401).json("no token");
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const foundUser = await User.findOne({ username });
  if (foundUser) {
    const passOK = bcrypt.compareSync(password, foundUser.password);
    if (passOK) {
      jwt.sign(
        { userID: foundUser._id, username },
        jwtSecret,
        {},
        (err, token) => {
          if (err) throw err;
          res
            .cookie("token", token, { sameSite: "none", secure: true })
            .status(200)
            .json({
              id: foundUser._id,
            });
        }
      );
    }
  }
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const createdUser = await User.create({
      username,
      password: hashedPassword,
    });

    jwt.sign(
      { userID: createdUser._id, username },
      jwtSecret,
      {},
      (err, token) => {
        if (err) {
          console.error("JWT signing error:", err);
          return res.status(500).json({ error: "Error creating token" });
        }
        res
          .cookie("token", token, { sameSite: "none", secure: true })
          .status(201)
          .json({
            id: createdUser._id,
          });
      }
    );
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Error during registration" });
  }
});

const server = app.listen(4040);

const wss = new WebSocketServer({ server });
wss.on("connection", (connection, req) => {
  const cookies = req.headers.cookie;

  if (cookies) {
    const tokenCookieString = cookies
      .split(";")
      .find((str) => str.startsWith("token="));
    if (tokenCookieString) {
      const token = tokenCookieString.split("=")[1];
      if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
          if (err) throw err;
          const { userID, username } = userData;
          connection.userId = userID;
          connection.username = username;
        });
      }
    }
  }
  // --------------------------------------------------------------

  connection.on("message", async (message) => {
    const messageData = JSON.parse(message.toString());
    console.log(messageData);
    const { recipient, text } = messageData;
    if (recipient && text) {
      const messageDoc = await MessageModal.create({
        sender: connection.userId,
        recipient,
        text,
      });

      [...wss.clients]
        .filter((c) => c.userId === recipient)
        .forEach((c) =>
          c.send(
            JSON.stringify({
              text,
              sender: connection.userId,
              recipient,
              _id: messageDoc._id,
            })
          )
        );
    }
  });

  // --------------------------------------------------------------

  [...wss.clients].forEach((client) => {
    client.send(
      JSON.stringify({
        online: [...wss.clients].map((c) => ({
          userId: c.userId,
          username: c.username,
        })),
      })
    );
  });
});
