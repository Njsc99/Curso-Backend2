import mongoose from "mongoose";
import app from "./app.js"; // ✅ Importa la app configurada

const PORT = 8080;
const MONGO_URI = "mongodb+srv://nicolasjsaezc_db_user:w6Uxusn2FecY3PQV@cluster0.gc6p5pv.mongodb.net/";

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("✅ Connected to MongoDB");
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("❌ Error connecting to MongoDB:", error);
    });