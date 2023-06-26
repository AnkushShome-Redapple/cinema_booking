"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cinema_1 = require("./library/cinema");
const booking_1 = require("./controller/booking");
const app = (0, express_1.default)();
app.use(express_1.default.json());
mongoose_1.default
    .connect('mongodb://localhost:27017/cinema-ticket')
    .then(() => {
    console.log('Connected to MongoDB');
    (0, booking_1.createRoutes)(app);
    startServer();
})
    .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});
function startServer() {
    const port = 5000;
    // ... Set up routes and middleware
    const cinema = new cinema_1.Cinema();
    cinema.processQueue(); // Start consuming the queue
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
}
