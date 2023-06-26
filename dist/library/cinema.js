"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cinema = void 0;
const schema_1 = require("../schemas/schema");
const callback_api_1 = require("amqplib/callback_api");
class Cinema {
    constructor() {
        // Initialize the channel when the Cinema instance is created
        (0, callback_api_1.connect)('amqp://localhost:5672', (error, connection) => {
            if (error) {
                throw error;
            }
            connection.createChannel((error, channel) => {
                if (error) {
                    throw error;
                }
                this.channel = channel;
                this.channel.assertQueue('seat-purchase-queue');
            });
        });
    }
    processQueue() {
        if (!this.channel) {
            // Handle case when the channel is not initialized
            console.log('channel is not initialized');
            return;
        }
        this.channel.consume('seat-purchase-queue', (msg) => __awaiter(this, void 0, void 0, function* () {
            if (!msg) {
                // Handle case when no message is received
                console.log('no message is received');
                return;
            }
            const { cinemaId, seatNumber } = JSON.parse(msg.content.toString());
            yield this.purchaseSeat(cinemaId, seatNumber);
            this.channel.ack(msg); // Acknowledge the message to remove it from the queue
        }));
    }
    createCinema(numSeats) {
        return __awaiter(this, void 0, void 0, function* () {
            const cinema = new schema_1.CinemaModel({
                numSeats,
                seats: Array.from({ length: numSeats }, (_, i) => i + 1),
            });
            yield cinema.save();
            return cinema._id.toString();
        });
    }
    purchaseSeat(cinemaId, seatNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            const cinema = yield schema_1.CinemaModel.findById(cinemaId);
            if (!cinema) {
                return null;
            }
            if (cinema.seats.includes(seatNumber)) {
                cinema.seats = cinema.seats.filter((seat) => seat !== seatNumber);
                yield cinema.save();
                return seatNumber;
            }
            return null;
        });
    }
    purchaseConsecutiveSeats(cinemaId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cinema = yield schema_1.CinemaModel.findById(cinemaId);
            if (!cinema) {
                return null;
            }
            const consecutiveSeats = [];
            let count = 0;
            for (const seat of cinema.seats) {
                if (count === 2) {
                    break;
                }
                if (consecutiveSeats.length === 0 || consecutiveSeats[consecutiveSeats.length - 1] === seat - 1) {
                    consecutiveSeats.push(seat);
                    count++;
                }
                else {
                    consecutiveSeats.length = 0; // Reset the list
                    count = 0;
                }
            }
            if (count === 2) {
                cinema.seats = cinema.seats.filter((seat) => !consecutiveSeats.includes(seat));
                yield cinema.save();
                return consecutiveSeats;
            }
            return null;
        });
    }
    isConsecutiveSeatsAvailable(cinemaId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('cinemaId', cinemaId);
            const cinema = yield schema_1.CinemaModel.findOne({ _id: cinemaId });
            if (!cinema) {
                // Handle case when cinema is not found
                console.log('cinema not found');
                return false;
            }
            const seats = cinema.numSeats;
            const bookedSeats = cinema.seats;
            const consecutiveSeats = [];
            let count = 0;
            for (let i = 1; i <= seats; i++) {
                if (bookedSeats.includes(i)) {
                    count = 0;
                    consecutiveSeats.length = 0;
                }
                else {
                    count++;
                    consecutiveSeats.push(i);
                    if (count === 2) {
                        return true;
                    }
                }
            }
            return false;
        });
    }
}
exports.Cinema = Cinema;
