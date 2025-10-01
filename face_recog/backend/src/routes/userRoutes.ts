import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { auth } from '../middleware/auth';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    console.log('Attempting to register user:', { email, name }); // Debug log

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email); // Debug log
      return res.status(400).json({ error: 'Email already exists' });
    }

    const user = new User({ email, password, name });
    await user.save();
    console.log('User created successfully:', user._id); // Debug log

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({ 
      user: {
        _id: user._id,
        email: user.email,
        name: user.name
      }, 
      token 
    });
  } catch (error) {
    console.error('Registration error:', error); // Debug log
    res.status(400).json({ 
      error: 'Error creating user',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    console.log('Attempting to login user:', email); // Debug log
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email); // Debug log
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Invalid password for user:', email); // Debug log
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log('Login successful:', user._id); // Debug log

    res.json({ 
      user: {
        _id: user._id,
        email: user.email,
        name: user.name
      }, 
      token 
    });
  } catch (error) {
    console.error('Login error:', error); // Debug log
    res.status(400).json({ 
      error: 'Error logging in',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    res.json({
      _id: req.user._id,
      email: req.user.email,
      name: req.user.name
    });
  } catch (error) {
    console.error('Profile fetch error:', error); // Debug log
    res.status(400).json({ error: 'Error fetching profile' });
  }
});

// Update user profile
router.patch('/profile', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'password'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ error: 'Invalid updates' });
  }

  try {
    updates.forEach(update => {
      (req.user as any)[update] = req.body[update];
    });
    await req.user.save();
    res.json({
      _id: req.user._id,
      email: req.user.email,
      name: req.user.name
    });
  } catch (error) {
    console.error('Profile update error:', error); // Debug log
    res.status(400).json({ error: 'Error updating profile' });
  }
});

export const userRouter = router;
