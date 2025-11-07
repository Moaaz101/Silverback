import { Router } from "express";

const router = Router();

// Validation helper functions
const validateFighterData = (data) => {
  const errors = [];
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string');
  }
  
  // Phone is optional - only validate if provided
  if (data.phone !== null && data.phone !== undefined && data.phone !== '') {
    if (typeof data.phone !== 'string' || data.phone.trim().length === 0) {
      errors.push('Phone must be a non-empty string if provided');
    }
  }
  
  if (data.coachId !== null && data.coachId !== undefined) {
    if (!Number.isInteger(data.coachId) || data.coachId <= 0) {
      errors.push('Coach ID must be a positive integer');
    }
  }
  
  return errors;
};

const validateId = (id) => {
  const parsedId = parseInt(id);
  if (isNaN(parsedId) || parsedId <= 0) {
    return { valid: false, error: 'ID must be a positive integer' };
  }
  return { valid: true, id: parsedId };
};

// GET all fighters
router.get("/", async (req, res) => {
  try {
    const fighters = await req.prisma.fighter.findMany({
      include: { coach: true },
    });
    res.json(fighters);
  } catch (error) {
    console.error('Error fetching fighters:', error);
    res.status(500).json({ error: 'Failed to fetch fighters' });
  }
});

// GET single fighter
router.get("/:id", async (req, res) => {
  try {
    const validation = validateId(req.params.id);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }
    
    const fighter = await req.prisma.fighter.findUnique({
      where: { id: validation.id },
      include: { coach: true, attendances: true, payments: true },
    });
    
    if (!fighter) {
      return res.status(404).json({ error: 'Fighter not found' });
    }
    
    res.json(fighter);
  } catch (error) {
    console.error('Error fetching fighter:', error);
    res.status(500).json({ error: 'Failed to fetch fighter' });
  }
});

// POST create new fighter
router.post("/", async (req, res) => {
  try {
    const validationErrors = validateFighterData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }
    
    // Verify coach exists if coachId provided
    if (req.body.coachId) {
      const coach = await req.prisma.coach.findUnique({
        where: { id: req.body.coachId }
      });
      if (!coach) {
        return res.status(400).json({ error: 'Coach not found' });
      }
    }
    
    const fighter = await req.prisma.fighter.create({ data: req.body });
    res.status(201).json(fighter);
  } catch (error) {
    console.error('Error creating fighter:', error);
    res.status(500).json({ error: 'Failed to create fighter' });
  }
});

// PUT update fighter
router.put("/:id", async (req, res) => {
  try {
    const validation = validateId(req.params.id);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }
    
    const validationErrors = validateFighterData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }
    
    // Verify fighter exists
    const existingFighter = await req.prisma.fighter.findUnique({
      where: { id: validation.id }
    });
    if (!existingFighter) {
      return res.status(404).json({ error: 'Fighter not found' });
    }
    
    // Verify coach exists if coachId provided
    if (req.body.coachId) {
      const coach = await req.prisma.coach.findUnique({
        where: { id: req.body.coachId }
      });
      if (!coach) {
        return res.status(400).json({ error: 'Coach not found' });
      }
    }
    
    const updated = await req.prisma.fighter.update({
      where: { id: validation.id },
      data: req.body,
    });
    res.json(updated);
  } catch (error) {
    console.error('Error updating fighter:', error);
    res.status(500).json({ error: 'Failed to update fighter' });
  }
});

// DELETE fighter
router.delete("/:id", async (req, res) => {
  try {
    const validation = validateId(req.params.id);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }
    
    // Verify fighter exists
    const existingFighter = await req.prisma.fighter.findUnique({
      where: { id: validation.id }
    });
    if (!existingFighter) {
      return res.status(404).json({ error: 'Fighter not found' });
    }
    
    await req.prisma.fighter.delete({ where: { id: validation.id } });
    res.json({ message: "Fighter deleted" });
  } catch (error) {
    console.error('Error deleting fighter:', error);
    res.status(500).json({ error: 'Failed to delete fighter' });
  }
});

// GET fighters by coach
router.get("/by-coach/:coachId", async (req, res) => {
  try {
    const validation = validateId(req.params.coachId);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }
    
    const fighters = await req.prisma.fighter.findMany({
      where: { coachId: validation.id },
      include: { coach: true },
    });
    res.json(fighters);
  } catch (error) {
    console.error('Error fetching fighters by coach:', error);
    res.status(500).json({ error: 'Failed to fetch fighters' });
  }
});

export default router;
