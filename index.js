import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "dotenv";
import mongoose from "mongoose";
import http from "http";
import router from "./routes/user.routes.js";
import morgan from "morgan";

const app = express();
const server = http.createServer(app);
config();

const PORT = 3000;

// CORS options
const corsOptions = {
  origin:['http://localhost:3001',
  'http://localhost:3002',"*"] , // The client-side URL
  credentials: true // Allow credentials
};

// Use CORS with options
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(morgan('dev'));

mongoose.connect(process.env.MONGODB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("connected", () => {
  console.log(`Connected to MongoDB at ${process.env.MONGODB}`);
});

db.on("error", (err) => {
  console.error(`MongoDB connection error: ${err}`);
});

db.on("disconnected", () => {
  console.log("Disconnected from MongoDB");
});

app.get("/", (req, res) => {
  return res.status(200).send("hello");
});

app.use("/users", router);

server.listen(PORT, () => {
  console.log(`Server is listening on port:${PORT}`);
});
