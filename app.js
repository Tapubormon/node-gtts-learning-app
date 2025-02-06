const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const gTTS = require("gtts");


const app = express();
app.use(cors());
app.use(express.json());

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
// Serve static files from "public" folder
app.use(express.static("public"));

const wordLists = require('./wordlist.json');


// Home route to render `index.html`
app.get("/", (req, res) => {
    res.render("index", { wordLists }); 
});

// API to fetch words from data.json based on the subject
app.get("/api/words/:subject", (req, res) => {
    const subject = req.params.subject;

    // Path to the data.json file
    const dataFilePath = path.join(__dirname, "wordlist.json");

    // Read the data.json file
    fs.readFile(dataFilePath, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Error reading data file" });
        }

        const parsedData = JSON.parse(data);

        // Check if the subject exists in the data and send the words back
        const wordlist = parsedData.find(item => item.subject === subject);
        
        if (wordlist) {
            res.json(wordlist.value);  // Send the 'value' array from the matched subject
        } else {
            res.status(404).json({ message: "Subject not found" });
        }
    });
});

// Google TTS API endpoint with voice selection
app.post("/speak", (req, res) => {
    const { word } = req.body;

    if (!word || typeof word !== "string") {
        return res.status(400).json({ error: "Invalid or missing word" });
    }

    console.log("Generating speech for:", word);
    
    const tts = new gTTS(word, "en");
    const filePath = `./public/${word}.mp3`;

    tts.save(filePath, (err) => {
        if (err) {
            console.error("TTS Error:", err);
            return res.status(500).json({ error: "Error generating speech" });
        }
        const fileUrl = `${req.protocol}://${req.get("host")}/${word}.mp3`;
        res.json({ url: fileUrl });
        // res.json({ url: `http://localhost:3000/${word}.mp3` });
        // Delete the file after sending the response
        setTimeout(() => {
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error("Error deleting file:", unlinkErr);
                } else {
                    console.log(`${filePath} has been deleted.`);
                }
            });
        }, 5000); // Wait for 5 seconds before deletion
    });
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
