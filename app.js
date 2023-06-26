"use strict";
exports.__esModule = true;
var express_1 = require("express");
var mongoose_1 = require("mongoose");
var booking_1 = require("./controller/booking");
var app = (0, express_1["default"])();
app.use(express_1["default"].json());
var connectOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};
mongoose_1["default"]
    .connect('mongodb://localhost:27017/cinema-ticket', connectOptions)
    .then(function () {
    console.log('Connected to MongoDB');
    (0, booking_1.createRoutes)(app);
    startServer();
})["catch"](function (error) {
    console.error('Error connecting to MongoDB:', error);
});
function startServer() {
    app.listen(3000, function () {
        console.log('Server is running on port 3000');
    });
}
