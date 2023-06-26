import express from 'express';
import mongoose, { ConnectOptions } from 'mongoose';
import { Cinema } from './library/cinema';
import { createRoutes } from './controller/booking';

const app = express();
app.use(express.json());

mongoose
    .connect('mongodb://localhost:27017/cinema-ticket')
    .then(() => {
        console.log('Connected to MongoDB');
        createRoutes(app);
        startServer();
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });

function startServer() {
    const port = 5000;

    // ... Set up routes and middleware

    const cinema = new Cinema();
    cinema.processQueue(); // Start consuming the queue

    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
}