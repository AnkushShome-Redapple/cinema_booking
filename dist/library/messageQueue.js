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
exports.consumeFromQueue = exports.sendToQueue = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
function sendToQueue(message) {
    return __awaiter(this, void 0, void 0, function* () {
        const queue = 'seat-purchase-queue';
        const connection = yield amqplib_1.default.connect('amqp://localhost:5672');
        const channel = yield connection.createChannel();
        yield channel.assertQueue(queue);
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
        yield channel.close();
        yield connection.close();
    });
}
exports.sendToQueue = sendToQueue;
function consumeFromQueue(queue, callback) {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield amqplib_1.default.connect('amqp://localhost:5672');
        const channel = yield connection.createChannel();
        yield channel.assertQueue(queue);
        channel.consume(queue, callback);
        yield channel.close();
        yield connection.close();
    });
}
exports.consumeFromQueue = consumeFromQueue;
