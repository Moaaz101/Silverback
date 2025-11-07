import express from "express";
import bcrypt from "bcrypt";

const router = express.Router();

// TEMPORARY: One-time admin setup endpoint
// DELETE THIS FILE after creating admin!
router.post("/create-admin", async (req, res) => {
  try {
    const prisma = req.prisma;
    
    console.log('🔍 Checking for existing admin...');
    
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { username: "Silverback" }
    });

    if (existingAdmin) {
      console.log('⚠️  Admin already exists');
      return res.status(400).json({ 
        error: "Admin already exists",
        username: existingAdmin.username,
        message: "You can now delete this endpoint for security"
      });
    }

    console.log('👤 Creating admin account...');
    
    // Create admin
    const hashedPassword = await bcrypt.hash("password", 10);
    const admin = await prisma.admin.create({
      data: {
        username: "Silverback",
        password: hashedPassword
      }
    });

    console.log('✅ Admin created successfully!');
    console.log(`   Username: ${admin.username}`);

    res.json({ 
      success: true,
      message: "✅ Admin created successfully!",
      username: admin.username,
      defaultPassword: "password",
      warning: "DELETE THIS ENDPOINT IMMEDIATELY FOR SECURITY!",
      nextSteps: [
        "1. Login with username: Silverback and password: password",
        "2. Change your password immediately",
        "3. Delete backend/routes/setup.js",
        "4. Remove setup route from backend/index.js",
        "5. Push changes to GitHub"
      ]
    });
  } catch (error) {
    console.error(" Error creating admin:", error);
    res.status(500).json({ 
      error: "Failed to create admin",
      details: error.message 
    });
  }
});

export default router;
