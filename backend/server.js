import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const DB_PATH = path.join(__dirname, "data", "db.json");

// Initialize Mock DB
if (!fs.existsSync(path.join(__dirname, "data"))) {
    fs.mkdirSync(path.join(__dirname, "data"));
}
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ campaigns: [], donations: [] }));
}

const readDB = () => JSON.parse(fs.readFileSync(DB_PATH));
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

// API Routes
app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

app.get("/api/campaigns", (req, res) => {
    const db = readDB();
    res.json(db.campaigns);
});

app.post("/api/campaigns", (req, res) => {
    const { name, description, goal, owner, id } = req.body;
    const db = readDB();
    const newCampaign = { id, name, description, goal, owner, totalFunds: 0, isActive: true };
    db.campaigns.push(newCampaign);
    writeDB(db);
    res.status(201).json(newCampaign);
});

app.post("/api/donations", (req, res) => {
    const { campaignId, donor, encryptedPayload } = req.body;
    const db = readDB();
    const newDonation = { campaignId, donor, encryptedPayload, timestamp: Date.now() };
    db.donations.push(newDonation);
    
    // Update campaign funds locally if needed (for MVP simulation, though smart contract holds truth)
    writeDB(db);
    res.status(201).json(newDonation);
});

app.get("/api/campaigns/:id/donations", (req, res) => {
    const { id } = req.params;
    const db = readDB();
    const campaignDonations = db.donations.filter(d => d.campaignId == id);
    res.json(campaignDonations);
});

app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
