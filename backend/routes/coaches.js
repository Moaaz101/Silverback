import { Router } from 'express';
const router = Router();

// GET all coaches with schedules
router.get('/', async (req, res) => {
  const prisma = req.prisma;
  const coaches = await prisma.coach.findMany({
    include: { 
      schedules: true,
      fighters: true  // Include fighters to show assigned fighter count
    }
  });
  res.json(coaches);
});

// POST create a coach
router.post('/', async (req, res) => {
  const prisma = req.prisma;
  const { name, weeklySchedule } = req.body;

  try {
    const coach = await prisma.coach.create({
      data: {
        name,
        schedules: {
          create: weeklySchedule.map(entry => ({
            weekday: entry.dayOfWeek,
            time: entry.time
          }))
        }
      },
      include: { schedules: true }
    });

    res.json(coach);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST add schedule to a coach
router.post('/:id/schedule', async (req, res) => {
  const prisma = req.prisma;
  const coachId = parseInt(req.params.id);
  const schedule = await prisma.coachSchedule.createMany({
    data: req.body.map(entry => ({
      weekday: entry.dayOfWeek,
      time: entry.time,
      coachId
    }))
  });
  res.json(schedule);
});

export default router;
