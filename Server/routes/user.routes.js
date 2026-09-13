import express from 'express';
import { register, login, logout } from '../controllers/user.controller.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Route to check if the user is authenticated
router.get('/check-auth', isAuthenticated, (req, res) => {
    res.json({ userId: req.userId });
});

export default router;