import { Router } from 'express';
const router = Router();

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
  const prisma = req.prisma;
  const { date } = req.query;
  
  try {
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
    res.status(500).json({ error: error.message });
  }
});

// GET daily attendance overview (coaches with sessions today)
router.get('/daily-overview', async (req, res) => {
  const prisma = req.prisma;
  const { date } = req.query;
  
  try {
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
    res.status(500).json({ error: error.message });
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
  const prisma = req.prisma;
  const { attendanceRecords, date, adminOverride = false } = req.body;
  
  try {
    const attendanceDate = date ? new Date(date) : new Date();
    const { startOfDay, endOfDay } = getDayBoundaries(attendanceDate);
    
    const results = [];
    
    // Process each record individually to handle errors gracefully
    for (const record of attendanceRecords) {
      try {
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

          if (existingAttendance) {
            // Handle session adjustments directly within transaction
            let updatedSessionsLeft = fighter.sessionsLeft;
            
            if (shouldDeductOld && !shouldDeductNew) {
              // Was present/late, now absent → restore session
              updatedSessionsLeft += 1;
            } else if (!shouldDeductOld && shouldDeductNew) {
              // Was absent, now present/late → deduct session
              if (fighter.sessionsLeft > 0 || adminOverride) {
                updatedSessionsLeft -= 1;
              } else if (!adminOverride) {
                return {
                  fighterId: record.fighterId,
                  error: `Fighter ${fighter.name} has no sessions left (current: ${fighter.sessionsLeft}). Use admin override to proceed.`,
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
              if (fighter.sessionsLeft > 0 || adminOverride) {
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
              } else if (!adminOverride) {
                return {
                  fighterId: record.fighterId,
                  error: `Fighter ${fighter.name} has no sessions left (current: ${fighter.sessionsLeft}). Use admin override to proceed.`,
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
    res.status(500).json({ error: error.message });
  }
});

// POST single attendance record with transaction
router.post('/', async (req, res) => {
  const prisma = req.prisma;
  const { fighterId, coachId, status, sessionType, notes, date, createdBy, adminOverride = false } = req.body;
  
  try {
    // Validate status
    validateAttendanceStatus(status || 'present');
    
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
        if (fighter.sessionsLeft > 0 || adminOverride) {
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
        } else if (!adminOverride) {
          throw new Error(`Fighter ${fighter.name} has no sessions left (current: ${fighter.sessionsLeft}). Use admin override to proceed.`);
        }
      }

      return {
        attendance,
        sessionAdjustment
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE attendance record with transaction
router.delete('/:id', async (req, res) => {
  const prisma = req.prisma;
  const attendanceId = parseInt(req.params.id);
  
  try {
    // Handle deletion and session restoration within a transaction
    const result = await prisma.$transaction(async (tx) => {
      const attendance = await tx.attendance.findUnique({
        where: { id: attendanceId },
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
        where: { id: attendanceId }
      });

      return { 
        message: 'Attendance record deleted',
        sessionAdjustment
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }



});

router.get('/:id', async (req, res) => {
  const prisma = req.prisma;
  const fighterId = parseInt(req.params.id);
  const { startDate, endDate } = req.query;
  
  try {
    // Validate fighter exists
    const fighter = await prisma.fighter.findUnique({
      where: { id: fighterId }
    });
    
    if (!fighter) {
      return res.status(404).json({ error: `Fighter with ID ${fighterId} not found` });
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
        fighterId,
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
    res.status(500).json({ error: error.message });
  }
});



export default router;