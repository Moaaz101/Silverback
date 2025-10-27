import { Router } from "express";
const router = Router();

// Helper function to generate receipt number
function generateReceiptNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `RCP-${year}${month}${day}-${random}`;
}

// POST create payment with fighter record
router.post('/', async (req, res) => {
  const prisma = req.prisma;
  const { 
    fighterId, 
    fighterData,  // For new fighters
    amount, 
    method, 
    paymentType, 
    sessionsAdded,
    notes,
    createdBy
  } = req.body;
  
  try {
    // Use transaction to ensure both fighter and payment are created/updated
    const result = await prisma.$transaction(async (tx) => {
      let targetFighterId = fighterId;
      
      // If this is a new signup, create the fighter first
      if (paymentType === 'new_signup' && fighterData) {
        // Create new fighter
        const newFighter = await tx.fighter.create({
          data: {
            ...fighterData,
            coachId: fighterData.coachId ? parseInt(fighterData.coachId) : null,
            totalSessionCount: parseInt(fighterData.totalSessionCount),
            subscriptionDurationMonths: parseInt(fighterData.subscriptionDurationMonths),
            sessionsLeft: parseInt(fighterData.totalSessionCount) // Start with full sessions
          }
        });
        targetFighterId = newFighter.id;
      }
      // For renewal or top-up, update existing fighter
      else if ((paymentType === 'renewal' || paymentType === 'top_up') && targetFighterId) {
        const fighter = await tx.fighter.findUnique({
          where: { id: parseInt(targetFighterId) }
        });
        
        if (!fighter) {
          throw new Error(`Fighter with ID ${targetFighterId} not found`);
        }
        
        // For renewal, reset subscription start date and update sessions
        if (paymentType === 'renewal') {
          await tx.fighter.update({
            where: { id: parseInt(targetFighterId) },
            data: {
              subscriptionStartDate: new Date(),
              // For renewal, we're adding sessionsAdded to their total
              totalSessionCount: parseInt(sessionsAdded),
              sessionsLeft: parseInt(sessionsAdded),
              subscriptionDurationMonths: parseInt(req.body.subscriptionDurationMonths || fighter.subscriptionDurationMonths)
            }
          });
        }
        // For top-up, just add sessions to existing count
        else if (paymentType === 'top_up') {
          await tx.fighter.update({
            where: { id: parseInt(targetFighterId) },
            data: {
              sessionsLeft: fighter.sessionsLeft + parseInt(sessionsAdded)
            }
          });
        }
      }
      
      // Generate a receipt number
      const receiptNumber = generateReceiptNumber();
      
      // Create the payment record
      const payment = await tx.payment.create({
        data: {
          fighterId: parseInt(targetFighterId),
          amount: parseFloat(amount),
          method,
          paymentType,
          sessionsAdded: parseInt(sessionsAdded),
          notes,
          createdBy,
          receiptNumber
        },
        include: {
          fighter: true
        }
      });
      
      return payment;
    });
    
    res.json(result);
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET all payments with fighter details
router.get('/', async (req, res) => {
  const prisma = req.prisma;
  const { startDate, endDate, fighterId } = req.query;
  
  try {
    // Build the where clause based on filters
    const whereClause = {};
    
    // Date range filter
    if (startDate || endDate) {
      whereClause.date = {};
      
      if (startDate) {
        const startDateObj = new Date(startDate);
        startDateObj.setHours(0, 0, 0, 0);
        whereClause.date.gte = startDateObj;
      }
      
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        whereClause.date.lte = endDateObj;
      }
    }
    
    // Fighter filter
    if (fighterId) {
      whereClause.fighterId = parseInt(fighterId);
    }
    
    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: { 
        fighter: true 
      },
      orderBy: {
        date: 'desc'
      }
    });
    
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET payment by ID
router.get('/:id', async (req, res) => {
  const prisma = req.prisma;
  const paymentId = parseInt(req.params.id);
  
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { fighter: true }
    });
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET payment receipt
router.get('/:id/receipt', async (req, res) => {
  const prisma = req.prisma;
  const paymentId = parseInt(req.params.id);
  
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { fighter: true }
    });
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    // Here you would generate the actual receipt
    // For now, we'll just return the payment data structured for a receipt
    const receipt = {
      receiptNumber: payment.receiptNumber || `RCP-${payment.id}`,
      date: payment.date,
      fighter: {
        name: payment.fighter.name,
        id: payment.fighter.id
      },
      amount: payment.amount,
      paymentMethod: payment.method,
      paymentType: payment.paymentType,
      sessionsAdded: payment.sessionsAdded,
      notes: payment.notes,
      recordedBy: payment.createdBy
    };
    
    res.json(receipt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/earnings/by-coach', async (req, res) => {
  const prisma = req.prisma;
  const { month, year } = req.query;

  try {
    // 1. Define the date range for the filter
    let startDate, endDate;
    if (month && year) {
      // Month is 1-indexed, but Date constructor is 0-indexed
      startDate = new Date(Date.UTC(year, month - 1, 1));
      endDate = new Date(Date.UTC(year, month, 1));
    }

    // 2. Fetch all payments within the date range that are linked to a coach
    const payments = await prisma.payment.findMany({
      where: {
        // Apply date filter if it exists
        ...(startDate && endDate && {
          date: {
            gte: startDate,
            lt: endDate,
          },
        }),
        // Ensure the payment is linked to a fighter who has a coach
        fighter: {
          coachId: {
            not: null,
          },
        },
      },
      include: {
        fighter: {
          include: {
            coach: true, // Include the coach details
          },
        },
      },
    });

    // 3. Process the payments to calculate earnings per coach
    const earningsByCoach = payments.reduce((acc, payment) => {
      const coach = payment.fighter?.coach;
      if (!coach) return acc; // Skip if no coach is associated

      if (!acc[coach.id]) {
        acc[coach.id] = {
          coachId: coach.id,
          coachName: coach.name,
          totalEarnings: 0,
          paymentCount: 0,
        };
      }

      acc[coach.id].totalEarnings += payment.amount;
      acc[coach.id].paymentCount += 1;

      return acc;
    }, {});

    // 4. Convert the results object to an array and send response
    res.json(Object.values(earningsByCoach));

  } catch (error) {
    console.error('Error fetching coach earnings:', error);
    res.status(500).json({ error: 'Failed to fetch coach earnings' });
  }
});


export default router;