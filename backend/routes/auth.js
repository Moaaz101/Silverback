import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

/**
 * POST /auth/login
 * Authenticate admin and return JWT token
 */
router.post('/login', async (req, res) => {
  const prisma = req.prisma;
  
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username and password are required' 
      });
    }

    // Find admin in database
    const admin = await prisma.admin.findUnique({
      where: { username: username.trim() },
    });

    if (!admin) {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    // Generate JWT token (expires in 7 days)
    const token = jwt.sign(
      { 
        id: admin.id,
        username: admin.username,
        role: 'admin' 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: admin.id,
        username: admin.username,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed. Please try again.' 
    });
  }
});

/**
 * POST /auth/verify
 * Verify if the current token is valid
 */
router.post('/verify', authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: {
      id: req.admin.id,
      username: req.admin.username,
    }
  });
});

/**
 * POST /auth/change-password
 * Change admin password (requires authentication)
 */
router.post('/change-password', authenticateToken, async (req, res) => {
  const prisma = req.prisma;
  
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Current password and new password are required' 
      });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'New password must be at least 6 characters long' 
      });
    }

    // Get admin from database
    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.id },
    });

    if (!admin) {
      return res.status(404).json({ 
        error: 'Admin account not found' 
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword, 
      admin.password
    );

    if (!isCurrentPasswordValid) {
      return res.status(401).json({ 
        error: 'Current password is incorrect' 
      });
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password in database
    await prisma.admin.update({
      where: { id: admin.id },
      data: { 
        password: newPasswordHash,
        updatedAt: new Date(),
      },
    });

    console.log(`✅ Password changed successfully for admin: ${admin.username}`);

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      error: 'Failed to change password. Please try again.' 
    });
  }
});

/**
 * POST /auth/logout
 * Logout endpoint (token removal handled client-side)
 */
router.post('/logout', authenticateToken, (req, res) => {
  // With JWT, logout is primarily handled client-side by removing the token
  // This endpoint exists for consistency and future enhancements (e.g., token blacklisting)
  
  console.log(`Admin ${req.admin.username} logged out`);
  
  res.json({
    success: true,
    message: 'Logout successful',
  });
});

export default router;