require("dotenv").config()
const app=require("./src/app")
const connectDB=require("./src/config/database")
const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);
const PORT = process.env.PORT || 3000;
connectDB();

app.get("/health", (req, res) => res.status(200).send("OK"));

// Self ping to stay alive on Render free plan
const RENDER_URL = "https://interview-iq-t2ju.onrender.com";

setInterval(async () => {
  try {
    await fetch(RENDER_URL + "/health");
    console.log("Staying alive...");
  } catch (err) {
    console.error("Ping failed", err);
  }
}, 14 * 60 * 1000);

app.listen(PORT,()=>{
    console.log("Server running on port 3000")
})