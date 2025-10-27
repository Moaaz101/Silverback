import { Router } from "express";

const router = Router();

// GET all fighters
router.get("/", async (req, res) => {
  const fighters = await req.prisma.fighter.findMany({
    include: { coach: true },
  });
  res.json(fighters);
});

// GET single fighter
router.get("/:id", async (req, res) => {
  const fighter = await req.prisma.fighter.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { coach: true, attendances: true, payments: true },
  });
  res.json(fighter);
});

// POST create new fighter
router.post("/", async (req, res) => {
  const data = req.body;
  const fighter = await req.prisma.fighter.create({ data });
  res.json(fighter);
});

// PUT update fighter
router.put("/:id", async (req, res) => {
  const updated = await req.prisma.fighter.update({
    where: { id: parseInt(req.params.id) },
    data: req.body,
  });
  res.json(updated);
});

// DELETE fighter
router.delete("/:id", async (req, res) => {
  await req.prisma.fighter.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ message: "Fighter deleted" });
});

// GET fighters by coach
router.get("/by-coach/:coachId", async (req, res) => {
  const coachId = parseInt(req.params.coachId);
  const fighters = await req.prisma.fighter.findMany({
    where: { coachId },
    include: { coach: true },
  });
  res.json(fighters);
});

export default router;
