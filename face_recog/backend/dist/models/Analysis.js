"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Analysis = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const analysisSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['face', 'group', 'crowd'],
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    results: {
        type: mongoose_1.default.Schema.Types.Mixed,
        required: true,
    },
}, {
    timestamps: true,
});
exports.Analysis = mongoose_1.default.model('Analysis', analysisSchema);
