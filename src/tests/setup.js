"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
let mongoServer;
beforeAll(async () => {
    mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    if (mongoose_1.default.connection.readyState !== 0) {
        await mongoose_1.default.disconnect();
    }
    await mongoose_1.default.connect(mongoUri);
});
afterAll(async () => {
    await mongoose_1.default.disconnect();
    await mongoServer.stop();
});
afterEach(async () => {
    if (mongoose_1.default.connection.readyState === 1) {
        const collections = mongoose_1.default.connection.collections;
        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany({});
        }
    }
});
//# sourceMappingURL=setup.js.map