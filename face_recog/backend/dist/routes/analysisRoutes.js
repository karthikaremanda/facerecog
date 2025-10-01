"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analysisRouter = void 0;
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const auth_1 = require("../middleware/auth");
const Analysis_1 = require("../models/Analysis");
const router = express_1.default.Router();
// Configure multer for image upload
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only support jpeg, jpg or png'));
    },
});
// Create new analysis
router.post('/:type', auth_1.auth, upload.single('image'), async (req, res) => {
    try {
        const { type } = req.params;
        if (!['face', 'group', 'crowd'].includes(type)) {
            return res.status(400).json({ error: 'Invalid analysis type' });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'No image provided' });
        }
        const imageUrl = `/uploads/${req.file.filename}`;
        // Here you would typically process the image using your face recognition logic
        // For now, we'll just store some dummy results
        const results = {
            processed: true,
            timestamp: new Date(),
            // Add more analysis results here
        };
        const analysis = new Analysis_1.Analysis({
            userId: req.user._id,
            type,
            imageUrl,
            results,
        });
        await analysis.save();
        res.status(201).json(analysis);
    }
    catch (error) {
        res.status(400).json({ error: 'Error creating analysis' });
    }
});
// Get user's analysis history
router.get('/history', auth_1.auth, async (req, res) => {
    try {
        const analyses = await Analysis_1.Analysis.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(analyses);
    }
    catch (error) {
        res.status(400).json({ error: 'Error fetching analysis history' });
    }
});
// Get specific analysis
router.get('/:id', auth_1.auth, async (req, res) => {
    try {
        const analysis = await Analysis_1.Analysis.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });
        if (!analysis) {
            return res.status(404).json({ error: 'Analysis not found' });
        }
        res.json(analysis);
    }
    catch (error) {
        res.status(400).json({ error: 'Error fetching analysis' });
    }
});
exports.analysisRouter = router;
