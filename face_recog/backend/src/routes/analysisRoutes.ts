import express from 'express';
import multer from 'multer';
import path from 'path';
import { auth } from '../middleware/auth';
import { Analysis } from '../models/Analysis';

const router = express.Router();

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only support jpeg, jpg or png'));
  },
});

// Create new analysis
router.post('/:type', auth, upload.single('image'), async (req, res) => {
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

    const analysis = new Analysis({
      userId: req.user._id,
      type,
      imageUrl,
      results,
    });

    await analysis.save();
    res.status(201).json(analysis);
  } catch (error) {
    res.status(400).json({ error: 'Error creating analysis' });
  }
});

// Get user's analysis history
router.get('/history', auth, async (req, res) => {
  try {
    const analyses = await Analysis.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(analyses);
  } catch (error) {
    res.status(400).json({ error: 'Error fetching analysis history' });
  }
});

// Get specific analysis
router.get('/:id', auth, async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    res.json(analysis);
  } catch (error) {
    res.status(400).json({ error: 'Error fetching analysis' });
  }
});

export const analysisRouter = router;
