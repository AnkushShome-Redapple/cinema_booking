"use strict";
exports.__esModule = true;
exports.CinemaModel = void 0;
var mongoose_1 = require("mongoose");
var CinemaSchema = new mongoose_1.Schema({
    numSeats: { type: Number, required: true },
    seats: { type: [Number], required: true }
});
exports.CinemaModel = mongoose_1["default"].model('Cinema', CinemaSchema);
