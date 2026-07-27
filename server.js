require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

const ROBLOX_API_KEY = process.env.ROBLOX_API_KEY;
console.log("Key loaded:", ROBLOX_API_KEY ? "YES" : "NO");
console.log("Key length:", ROBLOX_API_KEY?.length);

app.get("/proxy/creator-store", async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        
        // Ensure proper TitleCase formatting for the body enum payload (e.g., Model, Audio, Plugin)
        let rawCategory = (req.query.category || "Model").toLowerCase();
        const category = rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1);

        if (!ROBLOX_API_KEY) {
            return res.status(500).json({ error: "Missing ROBLOX_API_KEY environment variable" });
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
                maxPageSize: 10 // Roblox v2 Open Cloud standard uses maxPageSize instead of maxResults
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
            res.status(500).json({ error: "Proxy server error" });
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Roblox Proxy running on port ${PORT}`);
});
