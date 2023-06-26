import { CinemaModel, ICinema } from '../schemas/schema';
import { ObjectId } from 'mongodb';
import { Channel, connect } from 'amqplib/callback_api';

export class Cinema {

    private channel!: Channel;

    constructor() {
        // Initialize the channel when the Cinema instance is created
        connect('amqp://localhost:5672', (error, connection) => {
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

    public processQueue() {
        if (!this.channel) {
          // Handle case when the channel is not initialized
          console.log('channel is not initialized')
          return;
        }
    
        this.channel.consume('seat-purchase-queue', async (msg) => {
          if (!msg) {
            // Handle case when no message is received
            console.log('no message is received')
            return;
          }
    
          const { cinemaId, seatNumber } = JSON.parse(msg.content.toString());
    
          await this.purchaseSeat(cinemaId, seatNumber);
    
          this.channel.ack(msg); // Acknowledge the message to remove it from the queue
        });
      }

    public async createCinema(numSeats: number): Promise<string> {
        const cinema = new CinemaModel({
            numSeats,
            seats: Array.from({ length: numSeats }, (_, i) => i + 1),
        });

        await cinema.save();

        return cinema._id.toString();
    }

    public async purchaseSeat(cinemaId: string, seatNumber: number): Promise<number | null> {
        const cinema = await CinemaModel.findById(cinemaId);

        if (!cinema) {
            return null;
        }

        if (cinema.seats.includes(seatNumber)) {
            cinema.seats = cinema.seats.filter((seat) => seat !== seatNumber);
            await cinema.save();
            return seatNumber;
        }

        return null;
    }

    public async purchaseConsecutiveSeats(cinemaId: string): Promise<number[] | null> {
        const cinema = await CinemaModel.findById(cinemaId);

        if (!cinema) {
            return null;
        }

        const consecutiveSeats: number[] = [];
        let count = 0;

        for (const seat of cinema.seats) {
            if (count === 2) {
                break;
            }

            if (consecutiveSeats.length === 0 || consecutiveSeats[consecutiveSeats.length - 1] === seat - 1) {
                consecutiveSeats.push(seat);
                count++;
            } else {
                consecutiveSeats.length = 0; // Reset the list
                count = 0;
            }
        }

        if (count === 2) {
            cinema.seats = cinema.seats.filter((seat) => !consecutiveSeats.includes(seat));
            await cinema.save();
            return consecutiveSeats;
        }

        return null;
    }

    public async isConsecutiveSeatsAvailable(cinemaId: string): Promise<boolean> {

        console.log('cinemaId', cinemaId);
        const cinema = await CinemaModel.findOne({ _id: cinemaId });

        if (!cinema) {
            // Handle case when cinema is not found
            console.log('cinema not found')
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
            } else {
                count++;
                consecutiveSeats.push(i);
                if (count === 2) {
                    return true;
                }
            }
        }

        return false;
    }
}