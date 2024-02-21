import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
import { notFoundError } from "./middlewares/error-handler.js";
import { errorHandler } from "./middlewares/error-handler.js";
import Routes from "./routes/Routes.js";
import PartenaireRoutes from "./routes/partenaireRoutes.js"
import ProductRoutes from "./routes/ProductRoutes.js";

import dotenv from 'dotenv';

// Creating an express app
const app = express();

dotenv.config();
// Setting the port number for the server (default to 9090 if not provided)
const PORT = 9090 || process.env.PORT;
const databaseName = 'PIM';

// Enabling debug mode for mongoose
mongoose.set('debug', true);

// Setting the global Promise library
mongoose.Promise = global.Promise;

// Connecting to the MongoDB database
mongoose.connect(`mongodb+srv://localhost:GWaB8yrPjyl265Vw@paymentforkids.vliqoot.mongodb.net/${databaseName}`)
    .then(() => {
        console.log(`Connected to  db`);
    })
    .catch((error) => {
        console.log(error);
    });

// Enabling Cross-Origin Resource Sharing
app.use(cors());

// Using morgan for logging HTTP requests
app.use(morgan('dev')); 

// Parsing JSON request bodies
app.use(express.json());

// Parsing URL-encoded request bodies with extended format
app.use(express.urlencoded({ extended: true }));

// Serving static files (images) from the 'public/images' directory
app.use('/img', express.static('public/images'));


// Importing the routes for the 'tests' resource
app.use('/api', Routes);
app.use('/partenaire', PartenaireRoutes)
app.use('/api', ProductRoutes);


// Using custom middleware for handling 404 errors
app.use(notFoundError);

// Using custom middleware for handling general errors
app.use(errorHandler); 

// Starting the server and listening on the specified port
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});