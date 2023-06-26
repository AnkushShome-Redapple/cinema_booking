import mongoose, { Document, Schema } from 'mongoose';

export interface ICinema extends Document {
  numSeats: number;
  seats: number[];
}

const CinemaSchema = new Schema<ICinema>({
  numSeats: { type: Number, required: true },
  seats: { type: [Number], required: true },
});

export const CinemaModel = mongoose.model<ICinema>('Cinema', CinemaSchema);