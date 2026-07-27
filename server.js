require("dotenv").config();

const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());

const ROBLOX_API_KEY = process.env.ROBLOX_API_KEY;

console.log("Key loaded:", ROBLOX_API_KEY ? "YES" : "NO");
console.log("Key length:", ROBLOX_API_KEY?.length);


// Homepage GUI
app.get("/", (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
<title>Wish Simulator Proxy</title>

<style>
body {
    margin: 0;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, #111827, #2563eb);
    font-family: Arial, sans-serif;
    color: white;
}

.card {
    width: 430px;
    padding: 40px;
    border-radius: 25px;
    text-align: center;
    background: rgba(255,255,255,0.12);
    backdrop-filter: blur(15px);
    box-shadow: 0 20px 50px rgba(0,0,0,0.35);
}

h1 {
    font-size: 34px;
}

.status {
    margin: 20px;
    color: #4ade80;
    font-size: 20px;
}

p {
    opacity: 0.85;
}

.button {
    display: inline-block;
    margin-top: 20px;
    padding: 14px 30px;
    border-radius: 12px;
    background: #3b82f6;
    color: white;
    text-decoration: none;
    transition: 0.3s;
}

.button:hover {
    transform: scale(1.05);
    background: #2563eb;
}

.footer {
    margin-top: 25px;
    opacity: 0.5;
    font-size: 13px;
}
</style>

</head>

<body>

<div class="card">

<h1>✨ Wish Simulator Proxy</h1>

<div class="status">
● Online
</div>

<p>
Roblox Creator Store API Gateway
</p>

<a class="button" href="/proxy/creator-store?keyword=tree&category=Model">
Test API
</a>

<div class="footer">
Powered by Node.js + Express
</div>

</div>

</body>
</html>
    `);
});


// Roblox Creator Store Proxy
app.get("/proxy/creator-store", async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        
        // Ensure proper TitleCase formatting for the body enum payload (e.g., Model, Audio, Plugin)
        let rawCategory = (req.query.category || "Model").toLowerCase();
        const category = rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1);

        if (!ROBLOX_API_KEY) {
            return res.status(500).json({ 
                error: "Missing ROBLOX_API_KEY environment variable" 
            });
        }

        console.log(`Searching Creator Store for "${keyword}" in category "${category}"`);

        // Clean, absolute endpoint URL without variable string manipulation
        const robloxUrl = "https://apis.roblox.com/toolbox-service/v2/assets:search";

        const robloxResponse = await axios.post(
            robloxUrl,
            { 
                // FIXED: Providing BOTH parameters explicitly inside the JSON payload body
                searchCategoryType: category,
                query: keyword, 
                maxPageSize: 10
            },
            { 
                headers: { 
                    "x-api-key": ROBLOX_API_KEY, 
                    "Content-Type": "application/json" 
                } 
            }
        );

        res.json(robloxResponse.data);

    } catch (error) {

        console.error("Roblox API Error:");

        if (error.response) {

            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);

            res.status(error.response.status).json({ 
                error: "Roblox API failed", 
                details: error.response.data 
            });

        } else {

            console.error(error.message);

            res.status(500).json({ 
                error: "Proxy server error" 
            });
        }
    }
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✅ Roblox Proxy running on port ${PORT}`);
});
