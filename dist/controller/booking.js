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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRoutes = void 0;
const cinema_1 = require("../library/cinema");
const validator_1 = __importDefault(require("../middleware/validator"));
const messageQueue_1 = require("../library/messageQueue");
function createRoutes(app) {
    const cinema = new cinema_1.Cinema();
    app.post('/cinemas', validator_1.default.validateCreateCinema, (req, res) => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            const numSeats = req.body.numSeats;
            const cinemaId = yield cinema.createCinema(numSeats);
            if (cinemaId) {
                response = {
                    error: false,
                    message: 'Cinema has been created!',
                    data: { cinemaId }
                };
            }
            else {
                response = {
                    error: true,
                    message: 'Someting went wrong!',
                    data: {}
                };
            }
            res.status(201).json(response);
        }
        catch (error) {
            response = {
                error: true,
                message: error,
                data: {}
            };
            res.status(500).json(response);
        }
    }));
    app.post('/cinemas/:cinemaId/seats/:seatNumber', (req, res) => __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            const cinemaId = req.params.cinemaId;
            const seatNumber = parseInt(req.params.seatNumber);
            (0, messageQueue_1.sendToQueue)({ cinemaId, seatNumber });
            console.log('Seat purchase request enqueued');
            //cinema.processQueue(); // Start consuming the queue
            res.status(201).json({});
            // response = {
            //     error: false,
            //     message: 'Seat booking process in enqueued',
            //     data: { purchasedSeat }
            // }
            //res.status(201).json(response);
            // const purchasedSeat = await cinema.purchaseSeat(cinemaId, seatNumber);
            // if (purchasedSeat !== null) {
            //     response = {
            //         error: false,
            //         message: 'Seat booking successfull!',
            //         data: { purchasedSeat }
            //     }
            //     res.status(201).json(response);
            // } else {
            //     res.status(400).json({ error: true, message: 'Seat already purchased or invalid seat number.', data: {} });
            // }
        }
        catch (error) {
            response = {
                error: true,
                message: error,
                data: {}
            };
            res.status(500).json(response);
        }
    }));
    app.post('/cinemas/:cinemaId/seats', (req, res) => __awaiter(this, void 0, void 0, function* () {
        const cinemaId = req.params.cinemaId;
        const consecutiveSeatsAvailable = yield cinema.isConsecutiveSeatsAvailable(cinemaId);
        //console.log('consecutiveSeatsAvailable', consecutiveSeatsAvailable);
        if (!consecutiveSeatsAvailable) {
            return res.status(400).json({ error: 'No two consecutive seats available' });
        }
        // Purchase the first two consecutive seats
        const seatsToBook = yield cinema.purchaseConsecutiveSeats(cinemaId);
        if (seatsToBook) {
            res.status(201).json({ seats: seatsToBook });
        }
        else {
            res.status(400).json({ seats: seatsToBook });
        }
    }));
}
exports.createRoutes = createRoutes;
