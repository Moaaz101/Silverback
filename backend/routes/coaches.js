import { Router } from 'express';
const router = Router();

// Validation helper functions
const validateCoachData = (data) => {
  const errors = [];
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string');
  }
  
  return errors;
};

const validateScheduleData = (schedules) => {
  const errors = [];
  const validWeekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  if (!Array.isArray(schedules) || schedules.length === 0) {
    errors.push('Schedule must be a non-empty array');
    return errors;
  }
  
  schedules.forEach((entry, index) => {
    if (!entry.dayOfWeek || !validWeekdays.includes(entry.dayOfWeek)) {
      errors.push(`Schedule entry ${index}: Invalid weekday. Must be one of: ${validWeekdays.join(', ')}`);
    }
    
    if (!entry.time || typeof entry.time !== 'string' || entry.time.trim().length === 0) {
      errors.push(`Schedule entry ${index}: Time is required and must be a non-empty string`);
    }
  });
  
  return errors;
};

const validateId = (id) => {
  const parsedId = parseInt(id);
  if (isNaN(parsedId) || parsedId <= 0) {
    return { valid: false, error: 'ID must be a positive integer' };
  }
  return { valid: true, id: parsedId };
};

// GET all coaches with schedules
router.get('/', async (req, res) => {
  try {
    const prisma = req.prisma;
    const coaches = await prisma.coach.findMany({
      include: { 
        schedules: true,
        fighters: true  // Include fighters to show assigned fighter count
      }
    });
    res.json(coaches);
  } catch (error) {
    console.error('Error fetching coaches:', error);
    res.status(500).json({ error: 'Failed to fetch coaches' });
  }
});

// POST create a coach
router.post('/', async (req, res) => {
  try {
    const prisma = req.prisma;
    const { name, weeklySchedule } = req.body;
    
    // Validate coach data
    const coachValidationErrors = validateCoachData({ name });
    if (coachValidationErrors.length > 0) {
      return res.status(400).json({ errors: coachValidationErrors });
    }
    
    // Validate schedule data if provided
    if (weeklySchedule) {
      const scheduleValidationErrors = validateScheduleData(weeklySchedule);
      if (scheduleValidationErrors.length > 0) {
        return res.status(400).json({ errors: scheduleValidationErrors });
      }
    }

    const coach = await prisma.coach.create({
      data: {
        name,
        schedules: weeklySchedule ? {
          create: weeklySchedule.map(entry => ({
            weekday: entry.dayOfWeek,
            time: entry.time
          }))
        } : undefined
      },
      include: { schedules: true }
    });

    res.status(201).json(coach);
  } catch (error) {
    console.error('Error creating coach:', error);
    res.status(500).json({ error: 'Failed to create coach' });
  }
});

// POST add schedule to a coach
router.post('/:id/schedule', async (req, res) => {
  try {
    const prisma = req.prisma;
    
    // Validate coach ID
    const validation = validateId(req.params.id);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }
    
    // Validate schedule data
    const scheduleValidationErrors = validateScheduleData(req.body);
    if (scheduleValidationErrors.length > 0) {
      return res.status(400).json({ errors: scheduleValidationErrors });
    }
    
    // Verify coach exists
    const coach = await prisma.coach.findUnique({
      where: { id: validation.id }
    });
    if (!coach) {
      return res.status(404).json({ error: 'Coach not found' });
    }
    
    const schedule = await prisma.coachSchedule.createMany({
      data: req.body.map(entry => ({
        weekday: entry.dayOfWeek,
        time: entry.time,
        coachId: validation.id
      }))
    });
    
    res.status(201).json(schedule);
  } catch (error) {
    console.error('Error adding schedule:', error);
    res.status(500).json({ error: 'Failed to add schedule' });
  }
});

// PUT update a coach
router.put('/:id', async (req, res) => {
  try {
    const prisma = req.prisma;
    const { name, weeklySchedule } = req.body;
    
    // Validate coach ID
    const validation = validateId(req.params.id);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }
    
    // Verify coach exists
    const existingCoach = await prisma.coach.findUnique({
      where: { id: validation.id }
    });
    if (!existingCoach) {
      return res.status(404).json({ error: 'Coach not found' });
    }
    
    // Validate coach data
    const coachValidationErrors = validateCoachData({ name });
    if (coachValidationErrors.length > 0) {
      return res.status(400).json({ errors: coachValidationErrors });
    }
    
    // Validate schedule data if provided
    if (weeklySchedule) {
      const scheduleValidationErrors = validateScheduleData(weeklySchedule);
      if (scheduleValidationErrors.length > 0) {
        return res.status(400).json({ errors: scheduleValidationErrors });
      }
    }

    // Update coach and replace schedules
    const coach = await prisma.coach.update({
      where: { id: validation.id },
      data: {
        name,
        schedules: weeklySchedule ? {
          deleteMany: {}, // Delete all existing schedules
          create: weeklySchedule.map(entry => ({
            weekday: entry.dayOfWeek,
            time: entry.time
          }))
        } : undefined
      },
      include: { 
        schedules: true,
        fighters: true 
      }
    });

    res.json(coach);
  } catch (error) {
    console.error('Error updating coach:', error);
    res.status(500).json({ error: 'Failed to update coach' });
  }
});

// DELETE a coach
router.delete('/:id', async (req, res) => {
  try {
    const prisma = req.prisma;
    
    // Validate coach ID
    const validation = validateId(req.params.id);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }
    
    // Verify coach exists
    const coach = await prisma.coach.findUnique({
      where: { id: validation.id },
      include: { 
        fighters: true,
        schedules: true,
        attendances: true
      }
    });
    
    if (!coach) {
      return res.status(404).json({ error: 'Coach not found' });
    }
    
    // Note: Deleting a coach will:
    // 1. Set coachId to NULL for all assigned fighters (thanks to optional relationship)
    // 2. Delete all coach schedules (cascade delete)
    // 3. Keep attendance records (they have coachName stored for history)
    
    // Delete the coach (cascades will handle schedules)
    await prisma.coach.delete({
      where: { id: validation.id }
    });
    
    res.json({ 
      message: 'Coach deleted successfully',
      affectedFighters: coach.fighters.length,
      deletedSchedules: coach.schedules.length
    });
  } catch (error) {
    console.error('Error deleting coach:', error);
    res.status(500).json({ error: 'Failed to delete coach' });
  }
});

export default router;
