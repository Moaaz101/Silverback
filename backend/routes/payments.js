import { Router } from "express";
const router = Router();

// Validation helper functions
const validatePaymentData = (data) => {
  const errors = [];
  const validPaymentTypes = ['new_signup', 'renewal', 'top_up'];
  const validPaymentMethods = ['cash', 'card', 'bank_transfer'];
  
  if (!data.amount || isNaN(parseFloat(data.amount)) || parseFloat(data.amount) <= 0) {
    errors.push('Amount must be a positive number');
  }
  
  if (!data.method || !validPaymentMethods.includes(data.method)) {
    errors.push(`Payment method must be one of: ${validPaymentMethods.join(', ')}`);
  }
  
  if (!data.paymentType || !validPaymentTypes.includes(data.paymentType)) {
    errors.push(`Payment type must be one of: ${validPaymentTypes.join(', ')}`);
  }
  
  if (!data.sessionsAdded || isNaN(parseInt(data.sessionsAdded)) || parseInt(data.sessionsAdded) <= 0) {
    errors.push('Sessions added must be a positive integer');
  }
  
  if (!data.createdBy || typeof data.createdBy !== 'string' || data.createdBy.trim().length === 0) {
    errors.push('Created by is required');
  }
  
  // Validate based on payment type
  if (data.paymentType === 'new_signup') {
    if (!data.fighterData) {
      errors.push('Fighter data is required for new signup');
    } else {
      if (!data.fighterData.name || typeof data.fighterData.name !== 'string') {
        errors.push('Fighter name is required');
      }
      // Phone is optional - no validation needed
    }
  } else if (data.paymentType === 'renewal' || data.paymentType === 'top_up') {
    if (!data.fighterId || isNaN(parseInt(data.fighterId)) || parseInt(data.fighterId) <= 0) {
      errors.push('Valid fighter ID is required for renewal or top-up');
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
  try {
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
    
    // Validate payment data
    const validationErrors = validatePaymentData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }
    
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
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

// GET all payments with fighter details
router.get('/', async (req, res) => {
  try {
    const prisma = req.prisma;
    const { startDate, endDate, fighterId } = req.query;
    
    // Build the where clause based on filters
    const whereClause = {};
    
    // Date range filter
    if (startDate || endDate) {
      whereClause.date = {};
      
      if (startDate) {
        const startDateObj = new Date(startDate);
        if (isNaN(startDateObj.getTime())) {
          return res.status(400).json({ error: 'Invalid start date format' });
        }
        startDateObj.setHours(0, 0, 0, 0);
        whereClause.date.gte = startDateObj;
      }
      
      if (endDate) {
        const endDateObj = new Date(endDate);
        if (isNaN(endDateObj.getTime())) {
          return res.status(400).json({ error: 'Invalid end date format' });
        }
        endDateObj.setHours(23, 59, 59, 999);
        whereClause.date.lte = endDateObj;
      }
    }
    
    // Fighter filter
    if (fighterId) {
      const validation = validateId(fighterId);
      if (!validation.valid) {
        return res.status(400).json({ error: 'Invalid fighter ID' });
      }
      whereClause.fighterId = validation.id;
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
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// GET payment by ID
router.get('/:id', async (req, res) => {
  try {
    const prisma = req.prisma;
    
    const validation = validateId(req.params.id);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }
    
    const payment = await prisma.payment.findUnique({
      where: { id: validation.id },
      include: { fighter: true }
    });
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    res.json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

// GET payment receipt
router.get('/:id/receipt', async (req, res) => {
  try {
    const prisma = req.prisma;
    
    const validation = validateId(req.params.id);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }
    
    const payment = await prisma.payment.findUnique({
      where: { id: validation.id },
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
    console.error('Error fetching receipt:', error);
    res.status(500).json({ error: 'Failed to fetch receipt' });
  }
});


router.get('/earnings/by-coach', async (req, res) => {
  try {
    const prisma = req.prisma;
    const { month, year } = req.query;

    // Validate month and year if provided
    if (month) {
      const monthNum = parseInt(month);
      if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        return res.status(400).json({ error: 'Month must be between 1 and 12' });
      }
    }
    
    if (year) {
      const yearNum = parseInt(year);
      if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
        return res.status(400).json({ error: 'Invalid year' });
      }
    }

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