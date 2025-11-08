import { Router } from 'express';
const router = Router();

// Helper function to check subscription status
const checkSubscriptionStatus = (fighter) => {
  const now = new Date();
  const startDate = new Date(fighter.subscriptionStartDate);
  const expirationDate = new Date(startDate);
  expirationDate.setMonth(expirationDate.getMonth() + fighter.subscriptionDurationMonths);
  
  const isExpiredByTime = now > expirationDate;
  const isExpiredBySessions = fighter.sessionsLeft <= 0;
  const isExpired = isExpiredByTime || isExpiredBySessions;
  
  return {
    isExpired,
    isExpiredByTime,
    isExpiredBySessions,
    expirationDate,
    sessionsLeft: fighter.sessionsLeft,
    reason: isExpiredBySessions ? 'sessions' : (isExpiredByTime ? 'time' : null)
  };
};

// Validation helper functions
const validateId = (id) => {
  const parsedId = parseInt(id);
  if (isNaN(parsedId) || parsedId <= 0) {
    return { valid: false, error: 'ID must be a positive integer' };
  }
  return { valid: true, id: parsedId };
};

const validateDate = (dateStr) => {
  if (!dateStr) return { valid: true, date: new Date() };
  
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }
  return { valid: true, date };
};

const validateAttendanceData = (data) => {
  const errors = [];
  const validStatuses = ['present', 'absent', 'late'];
  const validSessionTypes = ['group', 'private', 'semi-private'];
  
  if (!data.fighterId || isNaN(parseInt(data.fighterId)) || parseInt(data.fighterId) <= 0) {
    errors.push('Valid fighter ID is required');
  }
  
  if (data.status && !validStatuses.includes(data.status)) {
    errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
  }
  
  if (data.sessionType && !validSessionTypes.includes(data.sessionType)) {
    errors.push(`Session type must be one of: ${validSessionTypes.join(', ')}`);
  }
  
  if (!data.createdBy || typeof data.createdBy !== 'string' || data.createdBy.trim().length === 0) {
    errors.push('Created by is required');
  }
  
  return errors;
};

// Helper function to get start and end of day
function getDayBoundaries(date) {
  const targetDate = date ? new Date(date) : new Date();
  
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);
  
  return { startOfDay, endOfDay };
}

// GET attendance for a specific date
router.get('/', async (req, res) => {
  try {
    const prisma = req.prisma;
    const { date } = req.query;
    
    // Validate date if provided
    if (date) {
      const validation = validateDate(date);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }
    }

    const { startOfDay, endOfDay } = getDayBoundaries(date);

    const attendance = await prisma.attendance.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        fighter: true,
        coach: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

// GET daily attendance overview (coaches with sessions today)
router.get('/daily-overview', async (req, res) => {
  try {
    const prisma = req.prisma;
    const { date } = req.query;
    
    // Validate date if provided
    if (date) {
      const validation = validateDate(date);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }
    }
    
    const targetDate = date ? new Date(date) : new Date();
    const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    const { startOfDay, endOfDay } = getDayBoundaries(date);
    
    // Get coaches who have sessions today
    const coachesWithSessions = await prisma.coach.findMany({
      where: {
        schedules: {
          some: {
            weekday: dayName
          }
        }
      },
      include: {
        schedules: {
          where: {
            weekday: dayName
          }
        },
        fighters: {
          include: {
            attendances: {
              where: {
                date: {
                  gte: startOfDay,
                  lte: endOfDay
                }
              }
            }
          }
        }
      }
    });

    res.json(coachesWithSessions);
  } catch (error) {
    console.error('Error fetching daily overview:', error);
    res.status(500).json({ error: 'Failed to fetch daily overview' });
  }
});

// Helper function to validate attendance status
function validateAttendanceStatus(status) {
  const validStatuses = ['present', 'absent', 'late'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid attendance status: ${status}. Valid values are: ${validStatuses.join(', ')}`);
  }
  return status;
}

// Helper function to check for existing attendance on a date
async function checkExistingAttendance(tx, fighterId, startOfDay, endOfDay) {
  return await tx.attendance.findFirst({
    where: {
      fighterId: fighterId,
      date: {
        gte: startOfDay,
        lte: endOfDay
      }
    }
  });
}

// POST bulk attendance with transaction for atomicity
router.post('/bulk', async (req, res) => {
  try {
    const prisma = req.prisma;
    const { attendanceRecords, date } = req.body;
    
    // Validate inputs
    if (!Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
      return res.status(400).json({ error: 'Attendance records must be a non-empty array' });
    }
    
    if (date) {
      const dateValidation = validateDate(date);
      if (!dateValidation.valid) {
        return res.status(400).json({ error: dateValidation.error });
      }
    }
    
    const attendanceDate = date ? new Date(date) : new Date();
    const { startOfDay, endOfDay } = getDayBoundaries(attendanceDate);
    
    const results = [];
    
    // Process each record individually to handle errors gracefully
    for (const record of attendanceRecords) {
      try {
        // Validate each record
        const validationErrors = validateAttendanceData(record);
        if (validationErrors.length > 0) {
          results.push({
            fighterId: record.fighterId,
            errors: validationErrors,
            success: false
          });
          continue;
        }
        
        // Validate status
        try {
          validateAttendanceStatus(record.status);
        } catch (error) {
          results.push({
            fighterId: record.fighterId,
            error: error.message,
            success: false
          });
          continue;
        }
        
        // Wrap the fighter attendance update in a transaction
        const result = await prisma.$transaction(async (tx) => {
          // Get fighter and coach info
          const fighter = await tx.fighter.findUnique({
            where: { id: record.fighterId },
            include: { coach: true }
          });

          if (!fighter) {
            return {
              fighterId: record.fighterId,
              error: `Fighter with ID ${record.fighterId} not found`,
              success: false
            };
          }

          // Check if attendance already exists for this date
          const existingAttendance = await checkExistingAttendance(tx, record.fighterId, startOfDay, endOfDay);

          let attendanceRecord;
          let sessionAdjustment = null;
          const shouldDeductOld = existingAttendance && (existingAttendance.status === 'present' || existingAttendance.status === 'late');
          const shouldDeductNew = record.status === 'present' || record.status === 'late';
          
          // Check subscription status ONLY when:
          // 1. Creating NEW attendance with present/late status, OR
          // 2. Updating existing attendance from absent to present/late (new deduction)
          const needsSubscriptionCheck = shouldDeductNew && (!existingAttendance || !shouldDeductOld);
          
          if (needsSubscriptionCheck) {
            const subscriptionStatus = checkSubscriptionStatus(fighter);
            
            if (subscriptionStatus.isExpired) {
              const errorMessage = subscriptionStatus.isExpiredBySessions
                ? `${fighter.name} has no sessions remaining`
                : `${fighter.name}'s subscription expired on ${subscriptionStatus.expirationDate.toLocaleDateString()}`;
              
              return {
                fighterId: record.fighterId,
                error: errorMessage,
                success: false
              };
            }
          }

          if (existingAttendance) {
            // Handle session adjustments directly within transaction
            let updatedSessionsLeft = fighter.sessionsLeft;
            
            if (shouldDeductOld && !shouldDeductNew) {
              // Was present/late, now absent → restore session
              updatedSessionsLeft += 1;
            } else if (!shouldDeductOld && shouldDeductNew) {
              // Was absent, now present/late → deduct session
              // (Subscription check already done above)
              
              if (fighter.sessionsLeft > 0) {
                updatedSessionsLeft -= 1;
              } else {
                return {
                  fighterId: record.fighterId,
                  error: `Fighter ${fighter.name} has no sessions left (current: ${fighter.sessionsLeft}). Cannot mark attendance.`,
                  success: false
                };
              }
            }

            // Update sessions if needed
            if (updatedSessionsLeft !== fighter.sessionsLeft) {
              await tx.fighter.update({
                where: { id: record.fighterId },
                data: { sessionsLeft: updatedSessionsLeft }
              });
              
              // Re-fetch to get accurate session count
              const updatedFighter = await tx.fighter.findUnique({
                where: { id: record.fighterId },
                select: { sessionsLeft: true }
              });
              
              sessionAdjustment = {
                sessionAdjustment: updatedSessionsLeft - fighter.sessionsLeft,
                newSessionsLeft: updatedFighter.sessionsLeft
              };
            }

            // Update attendance record
            attendanceRecord = await tx.attendance.update({
              where: { id: existingAttendance.id },
              data: {
                status: record.status,
                sessionType: record.sessionType,
                notes: record.notes,
                createdBy: record.createdBy
              }
            });
          } else {
            // Create new attendance record
            attendanceRecord = await tx.attendance.create({
              data: {
                fighterId: record.fighterId,
                fighterName: fighter.name,
                coachId: fighter.coachId || 0,
                coachName: fighter.coach?.name || 'Unassigned',
                date: attendanceDate,
                status: record.status,
                sessionType: record.sessionType || 'group',
                notes: record.notes,
                createdBy: record.createdBy
              }
            });

            // Handle session deduction for new attendance within transaction
            if (shouldDeductNew) {
              if (fighter.sessionsLeft > 0) {
                const updatedSessionsLeft = fighter.sessionsLeft - 1;
                await tx.fighter.update({
                  where: { id: record.fighterId },
                  data: { sessionsLeft: updatedSessionsLeft }
                });
                
                // Re-fetch for accuracy
                const updatedFighter = await tx.fighter.findUnique({
                  where: { id: record.fighterId },
                  select: { sessionsLeft: true }
                });
                
                sessionAdjustment = {
                  sessionAdjustment: -1,
                  newSessionsLeft: updatedFighter.sessionsLeft
                };
              } else {
                return {
                  fighterId: record.fighterId,
                  error: `Fighter ${fighter.name} has no sessions left (current: ${fighter.sessionsLeft}). Cannot mark attendance.`,
                  success: false
                };
              }
            }
          }

          return {
            attendance: attendanceRecord,
            sessionAdjustment: sessionAdjustment,
            success: true
          };
        });

        results.push(result);
      } catch (error) {
        results.push({
          fighterId: record.fighterId,
          error: error.message,
          success: false
        });
      }
    }

    res.json(results);
  } catch (error) {
    console.error('Error processing bulk attendance:', error);
    res.status(500).json({ error: 'Failed to process bulk attendance' });
  }
});

// POST single attendance record with transaction
router.post('/', async (req, res) => {
  try {
    const prisma = req.prisma;
    const { fighterId, coachId, status, sessionType, notes, date, createdBy } = req.body;
    
    // Validate inputs
    const validationErrors = validateAttendanceData({ 
      fighterId, 
      status, 
      sessionType, 
      createdBy 
    });
    
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }
    
    // Validate status
    validateAttendanceStatus(status || 'present');
    
    if (date) {
      const dateValidation = validateDate(date);
      if (!dateValidation.valid) {
        return res.status(400).json({ error: dateValidation.error });
      }
    }
    
    const attendanceDate = date ? new Date(date) : new Date();
    const { startOfDay, endOfDay } = getDayBoundaries(attendanceDate);
    
    // Handle attendance creation and session adjustment within a transaction
    const result = await prisma.$transaction(async (tx) => {
      const fighter = await tx.fighter.findUnique({
        where: { id: fighterId },
        include: { coach: true }
      });

      if (!fighter) {
        throw new Error('Fighter not found');
      }
      
      // Check subscription status
      const subscriptionStatus = checkSubscriptionStatus(fighter);
      
      if (subscriptionStatus.isExpired) {
        const errorMessage = subscriptionStatus.isExpiredBySessions
          ? `Cannot mark attendance: Fighter has no sessions remaining (0/${fighter.totalSessionCount})`
          : `Cannot mark attendance: Subscription expired on ${subscriptionStatus.expirationDate.toLocaleDateString()}. ${subscriptionStatus.sessionsLeft} unused sessions.`;
        
        throw new Error(errorMessage);
      }
      
      // Check for existing attendance on this date
      const existingAttendance = await checkExistingAttendance(tx, fighterId, startOfDay, endOfDay);
      
      if (existingAttendance) {
        throw new Error(`Fighter already has an attendance record for this date. Please update the existing record instead.`);
      }

      const shouldDeductNew = status === 'present' || status === 'late';
      let sessionAdjustment = null;

      // Create attendance record
      const attendance = await tx.attendance.create({
        data: {
          fighterId,
          fighterName: fighter.name,
          coachId: coachId || fighter.coachId || 0,
          coachName: fighter.coach?.name || 'Unassigned',
          date: attendanceDate,
          status: status || 'present',
          sessionType: sessionType || 'group',
          notes,
          createdBy
        }
      });

      // Handle session deduction if needed
      if (shouldDeductNew) {
        if (fighter.sessionsLeft > 0) {
          const updatedSessionsLeft = fighter.sessionsLeft - 1;
          await tx.fighter.update({
            where: { id: fighterId },
            data: { sessionsLeft: updatedSessionsLeft }
          });
          
          // Re-fetch for accuracy
          const updatedFighter = await tx.fighter.findUnique({
            where: { id: fighterId },
            select: { sessionsLeft: true }
          });
          
          sessionAdjustment = {
            sessionAdjustment: -1,
            newSessionsLeft: updatedFighter.sessionsLeft
          };
        } else {
          throw new Error(`Fighter ${fighter.name} has no sessions left (current: ${fighter.sessionsLeft}). Cannot mark attendance.`);
        }
      }

      return {
        attendance,
        sessionAdjustment
      };
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating attendance:', error);
    res.status(500).json({ error: 'Failed to create attendance record' });
  }
});

// DELETE attendance record with transaction
router.delete('/:id', async (req, res) => {
  try {
    const prisma = req.prisma;
    
    const validation = validateId(req.params.id);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }
    
    // Handle deletion and session restoration within a transaction
    const result = await prisma.$transaction(async (tx) => {
      const attendance = await tx.attendance.findUnique({
        where: { id: validation.id },
        include: { fighter: true }
      });

      if (!attendance) {
        throw new Error('Attendance record not found');
      }

      // Restore session if it was marked as present or late
      const shouldRestore = attendance.status === 'present' || attendance.status === 'late';
      let sessionAdjustment = null;

      if (shouldRestore) {
        await tx.fighter.update({
          where: { id: attendance.fighterId },
          data: { 
            sessionsLeft: {
              increment: 1
            }
          }
        });
        
        // Re-fetch for accuracy
        const updatedFighter = await tx.fighter.findUnique({
          where: { id: attendance.fighterId },
          select: { sessionsLeft: true }
        });
        
        sessionAdjustment = {
          sessionAdjustment: 1,
          newSessionsLeft: updatedFighter.sessionsLeft
        };
      }

      await tx.attendance.delete({
        where: { id: validation.id }
      });

      return { 
        message: 'Attendance record deleted',
        sessionAdjustment
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({ error: 'Failed to delete attendance record' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const prisma = req.prisma;
    
    const validation = validateId(req.params.id);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }
    
    const { startDate, endDate } = req.query;
    
    // Validate dates if provided
    if (startDate) {
      const dateValidation = validateDate(startDate);
      if (!dateValidation.valid) {
        return res.status(400).json({ error: 'Invalid start date' });
      }
    }
    
    if (endDate) {
      const dateValidation = validateDate(endDate);
      if (!dateValidation.valid) {
        return res.status(400).json({ error: 'Invalid end date' });
      }
    }
    
    // Validate fighter exists
    const fighter = await prisma.fighter.findUnique({
      where: { id: validation.id }
    });
    
    if (!fighter) {
      return res.status(404).json({ error: `Fighter with ID ${validation.id} not found` });
    }
    
    // Set up date range filter
    const dateFilter = {};
    
    if (startDate) {
      const startDateObj = new Date(startDate);
      startDateObj.setHours(0, 0, 0, 0);
      dateFilter.gte = startDateObj;
    }
    
    if (endDate) {
      const endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999);
      dateFilter.lte = endDateObj;
    }
    
    // Query with or without date filter
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        fighterId: validation.id,
        ...(startDate || endDate ? { date: dateFilter } : {})
      },
      include: {
        coach: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });
    
    // Get summary statistics
    const summary = {
      totalRecords: attendanceRecords.length,
      present: attendanceRecords.filter(a => a.status === 'present').length,
      late: attendanceRecords.filter(a => a.status === 'late').length,
      absent: attendanceRecords.filter(a => a.status === 'absent').length,
    };
    
    res.json({
      fighter: {
        id: fighter.id,
        name: fighter.name,
        sessionsLeft: fighter.sessionsLeft
      },
      attendance: attendanceRecords,
      summary
    });
  } catch (error) {
    console.error('Error fetching fighter attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
});



export default router;