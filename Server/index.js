import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/user.routes.js";

dotenv.config();
connectDB();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Routes

app.use("/api/user", userRoutes);


app.get("/", (req, res) => {
    res.send("Death Realm");
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})