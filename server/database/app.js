const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3030;

// Middleware setup
app.use(cors());
app.use(express.json()); // Correct way to parse JSON bodies

// Connect to MongoDB
mongoose.connect("mongodb://mongo_db:27017/", {
    dbName: 'dealershipsDB'
}).then(() => {
    console.log("MongoDB connection successful!");
}).catch(err => {
    console.error("MongoDB connection error:", err);
});

const Reviews = require('./review');
const Dealerships = require('./dealership');

// Data seeding function
const seedDatabase = async () => {
    try {
        await Reviews.deleteMany({});
        await Reviews.insertMany(JSON.parse(fs.readFileSync("reviews.json", 'utf8'))['reviews']);
        console.log("Reviews data seeded successfully.");
        
        await Dealerships.deleteMany({});
        await Dealerships.insertMany(JSON.parse(fs.readFileSync("dealerships.json", 'utf8'))['dealerships']);
        console.log("Dealerships data seeded successfully.");

    } catch (error) {
        console.error("Error seeding database:", error);
    }
};

// Seed the database on application startup
seedDatabase();

// Express route to home
app.get('/', (req, res) => {
    res.send("Welcome to the Mongoose API!");
});

// Express route to fetch all reviews
app.get('/fetchReviews', async (req, res) => {
    try {
        const documents = await Reviews.find();
        res.json(documents);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching documents' });
    }
});

// Express route to fetch reviews by a particular dealer
app.get('/fetchReviews/dealer/:id', async (req, res) => {
    try {
        // Find reviews for the specific dealership
        const documents = await Reviews.find({ dealership: req.params.id });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching documents' });
    }
});

// Express route to fetch all dealerships
app.get('/fetchDealers', async (req, res) => {
    try {
        const documents = await Dealerships.find();
        res.json(documents);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching documents' });
    }
});

// Express route to fetch Dealers by a particular state
app.get('/fetchDealers/:state', async (req, res) => {
    try {
        // Corrected: Use req.params.state to get the state from the URL
        const documents = await Dealerships.find({ state: req.params.state });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching documents' });
    }
});

// Express route to fetch dealer by a particular id
app.get('/fetchDealer/:id', async (req, res) => {
    try {
        // Corrected: Use findOne for a single dealer, as per the route name
        const document = await Dealerships.findOne({ id: req.params.id });
        if (document) {
            res.json(document);
        } else {
            res.status(404).json({ error: 'Dealer not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error fetching document' });
    }
});

// Express route to insert review
app.post('/insert_review', async (req, res) => {
    try {
        // The body is already a JSON object thanks to express.json()
        const data = req.body;
        
        // This is much safer, as it relies on MongoDB's unique _id
        const review = new Reviews({
            "name": data['name'],
            "dealership": data['dealership'],
            "review": data['review'],
            "purchase": data['purchase'],
            "purchase_date": data['purchase_date'],
            "car_make": data['car_make'],
            "car_model": data['car_model'],
            "car_year": data['car_year'],
        });

        const savedReview = await review.save();
        res.json(savedReview);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error inserting review' });
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});