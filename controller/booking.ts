import { Request, Response, Express } from 'express';
import { Cinema } from '../library/cinema';
import Validator from '../middleware/validator';
import { sendToQueue } from '../library/messageQueue';

export function createRoutes(app: Express) {
    const cinema = new Cinema();

    app.post('/cinemas', Validator.validateCreateCinema, async (req: Request, res: Response) => {
        let response;
        try {
            const numSeats: number = req.body.numSeats;
            const cinemaId = await cinema.createCinema(numSeats);
            if (cinemaId) {
                response = {
                    error: false,
                    message: 'Cinema has been created!',
                    data: { cinemaId }
                }
            } else {
                response = {
                    error: true,
                    message: 'Someting went wrong!',
                    data: {}
                }
            }
            res.status(201).json(response);
        } catch (error) {
            response = {
                error: true,
                message: error,
                data: {}
            }
            res.status(500).json(response);
        }
    });

    app.post('/cinemas/:cinemaId/seats/:seatNumber', async (req: Request, res: Response) => {
        let response;
        try {
            const cinemaId: string = req.params.cinemaId;
            const seatNumber: number = parseInt(req.params.seatNumber);

            sendToQueue({ cinemaId, seatNumber });
            console.log('Seat purchase request enqueued');
            cinema.processQueue(); // Start consuming the queue
            res.status(201).json({
                error: false,
                message: 'Seat purchase request enqueued',
                data: {}
            });
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
        } catch (error) {
            response = {
                error: true,
                message: error,
                data: {}
            }
            res.status(500).json(response);
        }
    });

    app.post('/cinemas/:cinemaId/seats', async (req: Request, res: Response) => {
        
        const cinemaId = req.params.cinemaId;

        const consecutiveSeatsAvailable = await cinema.isConsecutiveSeatsAvailable(cinemaId);

        //console.log('consecutiveSeatsAvailable', consecutiveSeatsAvailable);

        if (!consecutiveSeatsAvailable) {
            return res.status(400).json({ error: 'No two consecutive seats available' });
        }

        // Purchase the first two consecutive seats
        const seatsToBook = await cinema.purchaseConsecutiveSeats(cinemaId);

        if(seatsToBook) {
            res.status(201).json({ seats: seatsToBook });
        }else{
            res.status(400).json({ seats: seatsToBook });
        }
    });
}