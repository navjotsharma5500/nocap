import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { prisma } from './lib/prisma';

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
  credentials: true
}));
app.use(express.json());

// JWT Auth Middleware
const authMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Optional auth - doesn't reject if no token, just doesn't set user
const optionalAuth = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      // Ignore invalid tokens for optional auth
    }
  }

  // Also support legacy x-user-id header for backwards compatibility
  if (!req.user && req.headers['x-user-id']) {
    req.user = { userId: req.headers['x-user-id'] };
  }

  next();
};

// --- Routes ---

// 1. Auth / Registration
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, rollNo, year, branch, role } = req.body;
    // In real app: hash password
    const user = await prisma.user.create({
      data: { name, email, password, rollNo, year, branch, role: role || 'STUDENT' },
    });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { society: true }
    });
    
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token with user claims
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        societyId: user.societyId || null,
        societyName: user.society?.name || null,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        rollNo: user.rollNo,
        societyId: user.societyId,
        societyName: user.society?.name,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user from token
app.get('/api/me', authMiddleware, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { society: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      rollNo: user.rollNo,
      societyId: user.societyId,
      societyName: user.society?.name,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// 2. Societies
app.get('/api/societies', async (req, res) => {
  const societies = await prisma.society.findMany();
  res.json(societies);
});

// Get student's society memberships
app.get('/api/student/:studentId/memberships', async (req, res) => {
  try {
    const { studentId } = req.params;
    const memberships = await prisma.membership.findMany({
      where: { userId: studentId },
      include: { society: true },
      orderBy: { createdAt: 'desc' },
    });
    
    // Check if student has any approved membership
    const approvedMembership = memberships.find(m => m.status === 'APPROVED');
    
    res.json({
      hasMembership: memberships.length > 0,
      hasApprovedMembership: !!approvedMembership,
      memberships,
      activeSociety: approvedMembership?.society || null,
    });
  } catch (error) {
    console.error('Get memberships error:', error);
    res.status(500).json({ error: 'Failed to get memberships' });
  }
});

app.post('/api/societies/join', async (req, res) => {
  try {
    const { userId, societyId, proofUrl } = req.body;
    const membership = await prisma.membership.create({
      data: { userId, societyId, proofUrl, status: 'PENDING' },
    });
    res.json(membership);
  } catch (error) {
    res.status(400).json({ error: 'Join request failed' });
  }
});

// Join society by code
app.post('/api/societies/join-by-code', async (req, res) => {
  try {
    const { userId, joinCode } = req.body;
    
    // Find society by join code
    const society = await prisma.society.findFirst({
      where: { joinCode: joinCode.toUpperCase() },
    });
    
    if (!society) {
      return res.status(404).json({ error: 'Invalid society code' });
    }
    
    // Check if already a member
    const existing = await prisma.membership.findUnique({
      where: { userId_societyId: { userId, societyId: society.id } },
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Already a member or pending approval' });
    }
    
    // Create membership request
    const membership = await prisma.membership.create({
      data: { userId, societyId: society.id, status: 'PENDING' },
      include: { society: true },
    });
    
    res.json(membership);
  } catch (error) {
    console.error('Join by code error:', error);
    res.status(400).json({ error: 'Join request failed' });
  }
});

// 3. EB Actions (Approve Members)
app.get('/api/eb/pending-members/:societyId', async (req, res) => {
  const { societyId } = req.params;
  const members = await prisma.membership.findMany({
    where: { societyId, status: 'PENDING' },
    include: { user: true },
  });
  res.json(members);
});

app.post('/api/eb/approve-member', async (req, res) => {
  const { membershipId, status } = req.body; // status: APPROVED | REJECTED
  const updated = await prisma.membership.update({
    where: { id: membershipId },
    data: { status },
  });
  res.json(updated);
});

// 4. Permission Requests
app.post('/api/permissions', async (req, res) => {
  try {
    const { studentId, societyId, reason, date, exitTime, returnTime } = req.body;
    
    // Validate required fields
    if (!studentId || !societyId || !reason || !date || !exitTime) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['studentId', 'societyId', 'reason', 'date', 'exitTime']
      });
    }
    
    const request = await prisma.permissionRequest.create({
      data: {
        studentId,
        societyId,
        reason,
        date: new Date(date),
        exitTime,
        returnTime: returnTime || exitTime,
        status: 'PENDING_EB',
      },
    });
    res.json(request);
  } catch (error) {
    res.status(400).json({ error: 'Request failed' });
  }
});

app.get('/api/permissions/student/:studentId', async (req, res) => {
  const { studentId } = req.params;
  const requests = await prisma.permissionRequest.findMany({
    where: { studentId },
    include: { society: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(requests);
});

// 5. Approval Workflow (EB -> President -> Faculty)
// EB - Get pending requests for review
app.get('/api/approvals/eb/:societyId', async (req, res) => {
  const { societyId } = req.params;
  const requests = await prisma.permissionRequest.findMany({
    where: { societyId, status: 'PENDING_EB' },
    include: { student: true },
    orderBy: { createdAt: 'asc' },
  });
  res.json(requests);
});

// President - Get pending requests
app.get('/api/approvals/president/:societyId', async (req, res) => {
  const { societyId } = req.params;
  const requests = await prisma.permissionRequest.findMany({
    where: { societyId, status: 'PENDING_PRESIDENT' },
    include: { student: true },
  });
  res.json(requests);
});

// Faculty Admin - Get all pending requests
app.get('/api/approvals/faculty', async (req, res) => {
  const requests = await prisma.permissionRequest.findMany({
    where: { status: 'PENDING_FACULTY' },
    include: { student: true, society: true },
    orderBy: { createdAt: 'asc' },
  });
  res.json(requests);
});

app.post('/api/approvals/update', async (req, res) => {
  const { requestId, status, type } = req.body; 
  // type: 'permission' | 'room' | 'venue'
  // status: 'PENDING_DOSA' (if approved by president) | 'APPROVED' (if approved by DoSA) | 'REJECTED'
  
  if (type === 'permission') {
    const updated = await prisma.permissionRequest.update({
      where: { id: requestId },
      data: { status },
    });
    res.json(updated);
  }
  // ... handle other types
});

// Faculty Admin - Approve and Generate QR Token
app.post('/api/approvals/faculty/approve', async (req, res) => {
  try {
    const { requestId } = req.body;
    
    const request = await prisma.permissionRequest.findUnique({
      where: { id: requestId },
      include: { student: true },
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Generate secure JWT token for QR code
    const qrToken = jwt.sign(
      {
        requestId: request.id,
        studentId: request.studentId,
        date: request.date.toISOString(),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      },
      JWT_SECRET
    );

    // Calculate expiry (2:00 AM next day)
    const expiresAt = new Date(request.date);
    expiresAt.setHours(26, 0, 0, 0); // 2 AM next day

    // Update request with QR token
    const updated = await prisma.permissionRequest.update({
      where: { id: requestId },
      data: {
        status: 'APPROVED',
        qrToken,
        qrGeneratedAt: new Date(),
        expiresAt,
      },
    });

    res.json({ 
      success: true, 
      qrToken, 
      request: updated,
      student: request.student 
    });
  } catch (error) {
    console.error('Approval error:', error);
    res.status(500).json({ error: 'Failed to approve request' });
  }
});

// Guard - Verify QR Code (Simple Single Scan)
app.post('/api/guard/verify-qr', async (req, res) => {
  try {
    const { qrToken, guardId } = req.body;

    if (!qrToken) {
      return res.json({ success: false, message: 'No QR token provided' });
    }

    // Verify JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(qrToken, JWT_SECRET);
    } catch (jwtError: any) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.json({ success: false, message: 'QR token expired' });
      }
      return res.json({ success: false, message: 'Invalid QR token' });
    }

    // Get permission request
    const request = await prisma.permissionRequest.findUnique({
      where: { id: decoded.requestId },
      include: {
        student: true,
        society: true,
      },
    });

    if (!request) {
      return res.json({ success: false, message: 'Pass not found in system' });
    }

    // Check expiry
    if (request.expiresAt && new Date() > request.expiresAt) {
      return res.json({ success: false, message: 'Pass expired' });
    }

    // Check status
    if (request.status !== 'APPROVED') {
      return res.json({ success: false, message: 'Pass not approved' });
    }

    // Mark as verified (optional - for audit trail)
    if (!request.verifiedAt) {
      await prisma.permissionRequest.update({
        where: { id: request.id },
        data: {
          verifiedAt: new Date(),
          verifiedBy: guardId || 'guard-unknown',
        },
      });
    }

    // Return success with student details
    res.json({
      success: true,
      message: '✓ STUDENT APPROVED TO LEAVE',
      student: {
        name: request.student.name,
        rollNo: request.student.rollNo,
        hostel: request.student.branch ? `${request.student.branch}-Block` : 'Unknown',
        reason: request.reason,
        exitTime: request.exitTime,
        returnTime: request.returnTime || 'Not specified',
        validUntil: request.expiresAt?.toLocaleString() || 'N/A',
        society: request.society.name,
        verifiedAt: request.verifiedAt?.toLocaleString() || 'Just now',
      },
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
});

// Get student's active pass with QR token
app.get('/api/student/:studentId/active-pass', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const activePass = await prisma.permissionRequest.findFirst({
      where: {
        studentId,
        status: 'APPROVED',
        qrToken: { not: null },
        verifiedAt: null,
        expiresAt: { gte: new Date() },
      },
      include: {
        student: true,
        society: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!activePass) {
      return res.json({ hasActivePass: false });
    }

    res.json({
      hasActivePass: true,
      pass: {
        id: activePass.id,
        qrToken: activePass.qrToken,
        studentName: activePass.student.name,
        rollNo: activePass.student.rollNo,
        hostel: activePass.student.branch ? `${activePass.student.branch}-Block` : 'Unknown',
        reason: activePass.reason,
        exitTime: activePass.exitTime,
        validUntil: activePass.expiresAt?.toLocaleString() || 'N/A',
        society: activePass.society.name,
      },
    });
  } catch (error) {
    console.error('Get active pass error:', error);
    res.status(500).json({ error: 'Failed to get active pass' });
  }
});

app.get('/api/approvals/faculty', async (req, res) => {
  const requests = await prisma.permissionRequest.findMany({
    where: { status: 'PENDING_FACULTY' as const },
    include: { student: true, society: true },
  });
  res.json(requests);
});

// 6. Guard View
app.get('/api/guard/verify/:requestId', async (req, res) => {
  const { requestId } = req.params;
  const request = await prisma.permissionRequest.findUnique({
    where: { id: requestId },
    include: { student: true },
  });
  res.json(request);
});

// Guard - Check-in (Return verification)
app.post('/api/guard/check-in', async (req, res) => {
  try {
    const { qrToken, guardId } = req.body;

    if (!qrToken) {
      return res.json({ success: false, message: 'No QR token provided' });
    }

    // Verify JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(qrToken, JWT_SECRET);
    } catch (jwtError: any) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.json({ success: false, message: 'QR token expired' });
      }
      return res.json({ success: false, message: 'Invalid QR token' });
    }

    // Get permission request
    const request = await prisma.permissionRequest.findUnique({
      where: { id: decoded.requestId },
      include: {
        student: true,
        society: true,
      },
    });

    if (!request) {
      return res.json({ success: false, message: 'Pass not found in system' });
    }

    // Check if already checked in
    if (request.checkInAt) {
      return res.json({
        success: false,
        message: 'Student already returned',
        student: {
          name: request.student.name,
          rollNo: request.student.rollNo,
          checkInAt: request.checkInAt.toLocaleString(),
        },
      });
    }

    // Check if was verified (exited)
    if (!request.verifiedAt) {
      return res.json({
        success: false,
        message: 'Student has not exited yet - cannot check in',
      });
    }

    // Mark as checked in
    const updated = await prisma.permissionRequest.update({
      where: { id: request.id },
      data: {
        checkInAt: new Date(),
        checkInBy: guardId || 'guard-unknown',
      },
    });

    // Calculate time out
    const timeOut = request.verifiedAt
      ? Math.round((Date.now() - request.verifiedAt.getTime()) / (1000 * 60))
      : 0;

    res.json({
      success: true,
      message: '✓ STUDENT RETURNED SAFELY',
      student: {
        name: request.student.name,
        rollNo: request.student.rollNo,
        hostel: request.student.branch ? `${request.student.branch}-Block` : 'Unknown',
        society: request.society.name,
        exitTime: request.verifiedAt?.toLocaleString() || 'Unknown',
        returnTime: new Date().toLocaleString(),
        timeOutMinutes: timeOut,
      },
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ success: false, message: 'Check-in failed' });
  }
});

// Admin - Get students currently out
app.get('/api/admin/students-out', async (req, res) => {
  try {
    const studentsOut = await prisma.permissionRequest.findMany({
      where: {
        status: 'APPROVED',
        verifiedAt: { not: null },
        checkInAt: null,
      },
      include: {
        student: true,
        society: true,
      },
      orderBy: { verifiedAt: 'asc' },
    });

    const now = new Date();
    const students = studentsOut.map((req) => {
      const returnTime = req.returnTime ? parseTimeString(req.returnTime, req.date) : null;
      const isOverdue = returnTime ? now > returnTime : false;

      return {
        id: req.id,
        name: req.student.name,
        rollNo: req.student.rollNo,
        hostel: req.student.branch ? `${req.student.branch}-Block` : 'Unknown',
        society: req.society.name,
        societyDomain: req.society.domain,
        reason: req.reason,
        exitTime: req.verifiedAt?.toLocaleString() || 'Unknown',
        expectedReturn: req.returnTime || 'Not specified',
        isOverdue,
        minutesOut: req.verifiedAt
          ? Math.round((now.getTime() - req.verifiedAt.getTime()) / (1000 * 60))
          : 0,
      };
    });

    res.json({
      total: students.length,
      students,
      festCount: students.filter((s) => s.societyDomain === 'FEST').length,
      societyCount: students.filter((s) => s.societyDomain === 'SOCIETY').length,
    });
  } catch (error) {
    console.error('Get students out error:', error);
    res.status(500).json({ error: 'Failed to get students out' });
  }
});

// Helper function to parse time string to Date
function parseTimeString(timeStr: string, baseDate: Date): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const result = new Date(baseDate);
  result.setHours(hours, minutes, 0, 0);
  // If time is before noon and seems like after midnight (e.g., 2:00 AM return)
  if (hours < 12 && hours < 6) {
    result.setDate(result.getDate() + 1);
  }
  return result;
}

// Admin - Comprehensive Stats
app.get('/api/admin/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all requests for today
    const todaysRequests = await prisma.permissionRequest.findMany({
      where: {
        date: { gte: today, lt: tomorrow },
      },
      include: { society: true },
    });

    // Students currently out
    const studentsOut = await prisma.permissionRequest.findMany({
      where: {
        status: 'APPROVED',
        verifiedAt: { not: null },
        checkInAt: null,
      },
      include: { student: true, society: true },
    });

    // Check for overdue students
    const now = new Date();
    const overdueStudents = studentsOut.filter((req) => {
      if (!req.returnTime) return false;
      const returnTime = parseTimeString(req.returnTime, req.date);
      return now > returnTime;
    });

    // Weekly trends (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyData = await prisma.permissionRequest.groupBy({
      by: ['date'],
      where: {
        createdAt: { gte: weekAgo },
      },
      _count: { id: true },
      orderBy: { date: 'asc' },
    });

    // Get society stats
    const societies = await prisma.society.findMany({
      include: {
        _count: { select: { members: true, permissionRequests: true } },
      },
    });

    res.json({
      studentsCurrentlyOut: studentsOut.length,
      studentsOutByDomain: {
        fest: studentsOut.filter((s) => s.society.domain === 'FEST').length,
        society: studentsOut.filter((s) => s.society.domain === 'SOCIETY').length,
      },
      todaysPermissions: {
        total: todaysRequests.length,
        approved: todaysRequests.filter((r) => r.status === 'APPROVED').length,
        pending: todaysRequests.filter((r) =>
          ['PENDING_EB', 'PENDING_PRESIDENT', 'PENDING_FACULTY'].includes(r.status)
        ).length,
        rejected: todaysRequests.filter((r) => r.status === 'REJECTED').length,
      },
      overdueStudents: overdueStudents.map((req) => ({
        name: req.student.name,
        rollNo: req.student.rollNo,
        society: req.society.name,
        expectedReturn: req.returnTime,
        exitTime: req.verifiedAt?.toLocaleString(),
      })),
      overdueCount: overdueStudents.length,
      permissionsByDomain: {
        fest: todaysRequests.filter((r) => r.society.domain === 'FEST').length,
        society: todaysRequests.filter((r) => r.society.domain === 'SOCIETY').length,
      },
      weeklyTrends: weeklyData.map((d) => ({
        date: d.date.toISOString().split('T')[0],
        count: d._count.id,
      })),
      societies: societies.map((s) => ({
        id: s.id,
        name: s.name,
        domain: s.domain,
        memberCount: s._count.members,
        permissionCount: s._count.permissionRequests,
      })),
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Society - Join by code
app.post('/api/societies/join-by-code', async (req, res) => {
  try {
    const { userId, joinCode } = req.body;

    if (!userId || !joinCode) {
      return res.status(400).json({ error: 'userId and joinCode are required' });
    }

    const society = await prisma.society.findUnique({
      where: { joinCode },
    });

    if (!society) {
      return res.status(404).json({ error: 'Invalid join code' });
    }

    // Check if already a member
    const existing = await prisma.membership.findUnique({
      where: { userId_societyId: { userId, societyId: society.id } },
    });

    if (existing) {
      return res.status(400).json({ error: 'Already a member of this society' });
    }

    // Auto-approve when joining with valid code
    const membership = await prisma.membership.create({
      data: {
        userId,
        societyId: society.id,
        status: 'APPROVED',
      },
      include: { society: true },
    });

    res.json({
      success: true,
      message: `Successfully joined ${society.name}`,
      membership,
    });
  } catch (error) {
    console.error('Join by code error:', error);
    res.status(500).json({ error: 'Failed to join society' });
  }
});

// Guard stats - Get today's activity
app.get('/api/guard/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const exits = await prisma.permissionRequest.count({
      where: {
        verifiedAt: { gte: today },
      },
    });

    const returns = await prisma.permissionRequest.count({
      where: {
        checkInAt: { gte: today },
      },
    });

    const currentlyOut = await prisma.permissionRequest.count({
      where: {
        status: 'APPROVED',
        verifiedAt: { not: null },
        checkInAt: null,
      },
    });

    res.json({
      todayExits: exits,
      todayReturns: returns,
      currentlyOut,
    });
  } catch (error) {
    console.error('Guard stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});


// ============ FLAGGING SYSTEM ============

// DOSA - Flag a student (HARD flag)
app.post('/api/admin/flag-student', async (req, res) => {
  try {
    const { studentId, reason, flaggedBy } = req.body;

    if (!studentId || !reason) {
      return res.status(400).json({ error: 'studentId and reason are required' });
    }

    const student = await prisma.user.update({
      where: { id: studentId },
      data: {
        isFlagged: true,
        flagType: 'HARD',
        flagReason: reason,
        flaggedBy: flaggedBy || 'DOSA',
        flaggedAt: new Date(),
      },
    });

    // Find student's society memberships to notify EBs
    const memberships = await prisma.membership.findMany({
      where: { userId: studentId, status: 'APPROVED' },
      include: { society: { include: { staff: true } } },
    });

    // Create notifications for all EBs of student's societies
    for (const membership of memberships) {
      const ebUsers = membership.society.staff.filter(s => s.role === 'SOCIETY_EB');
      for (const eb of ebUsers) {
        await prisma.notification.create({
          data: {
            userId: eb.id,
            type: 'MEMBER_FLAGGED',
            title: 'Member Flagged by DOSA',
            message: `${student.name} (${student.rollNo}) has been flagged. Reason: ${reason}`,
            metadata: { studentId, studentName: student.name, flagType: 'HARD' },
          },
        });
      }
    }

    res.json({ success: true, student });
  } catch (error) {
    console.error('Flag student error:', error);
    res.status(500).json({ error: 'Failed to flag student' });
  }
});

// DOSA - De-flag a student
app.post('/api/admin/deflag-student', async (req, res) => {
  try {
    const { studentId } = req.body;

    const student = await prisma.user.update({
      where: { id: studentId },
      data: {
        isFlagged: false,
        flagType: null,
        flagReason: null,
        flaggedBy: null,
        flaggedAt: null,
      },
    });

    res.json({ success: true, student });
  } catch (error) {
    console.error('Deflag student error:', error);
    res.status(500).json({ error: 'Failed to de-flag student' });
  }
});

// EB - Soft flag a member
app.post('/api/eb/soft-flag-member', async (req, res) => {
  try {
    const { studentId, reason, flaggedBy, societyId } = req.body;

    const student = await prisma.user.update({
      where: { id: studentId },
      data: {
        isFlagged: true,
        flagType: 'SOFT',
        flagReason: reason,
        flaggedBy: flaggedBy || 'Society EB',
        flaggedAt: new Date(),
      },
    });

    res.json({ success: true, student });
  } catch (error) {
    console.error('Soft flag error:', error);
    res.status(500).json({ error: 'Failed to flag member' });
  }
});

// EB - Request re-evaluation for flagged member
app.post('/api/eb/request-re-evaluation', async (req, res) => {
  try {
    const { studentId, reason, requestedBy, societyId } = req.body;

    const student = await prisma.user.findUnique({ where: { id: studentId } });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Find all admin users
    const admins = await prisma.user.findMany({ where: { role: 'FACULTY_ADMIN' } });

    // Create notification for admins
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'RE_EVAL_REQUESTED',
          title: 'Re-evaluation Request',
          message: `EB requests re-evaluation for ${student.name} (${student.rollNo}). Reason: ${reason}`,
          metadata: { studentId, studentName: student.name, requestedBy, societyId },
        },
      });
    }

    res.json({ success: true, message: 'Re-evaluation request sent to DOSA' });
  } catch (error) {
    console.error('Re-evaluation request error:', error);
    res.status(500).json({ error: 'Failed to request re-evaluation' });
  }
});

// Get flagged members for a society
app.get('/api/eb/flagged-members/:societyId', async (req, res) => {
  try {
    const { societyId } = req.params;

    const memberships = await prisma.membership.findMany({
      where: { societyId, status: 'APPROVED' },
      include: { user: true },
    });

    const flaggedMembers = memberships
      .filter(m => m.user.isFlagged)
      .map(m => ({
        id: m.user.id,
        name: m.user.name,
        rollNo: m.user.rollNo,
        flagType: m.user.flagType,
        flagReason: m.user.flagReason,
        flaggedBy: m.user.flaggedBy,
        flaggedAt: m.user.flaggedAt,
      }));

    res.json(flaggedMembers);
  } catch (error) {
    console.error('Get flagged members error:', error);
    res.status(500).json({ error: 'Failed to get flagged members' });
  }
});

// ============ NOTIFICATIONS ============

// Get notifications for user
app.get('/api/notifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

// Mark notification as read
app.post('/api/notifications/mark-read', async (req, res) => {
  try {
    const { notificationId } = req.body;
    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// ============ BULK REQUESTS ============

// EB - Create bulk permission request
app.post('/api/eb/create-bulk-request', async (req, res) => {
  try {
    const { societyId, createdBy, reason, date, exitTime, returnTime, documentUrl, studentIds } = req.body;

    if (!societyId || !reason || !date || !exitTime || !studentIds || studentIds.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create bulk request
    const bulkRequest = await prisma.bulkRequest.create({
      data: {
        societyId,
        createdBy,
        reason,
        date: new Date(date),
        exitTime,
        returnTime,
        documentUrl,
        status: 'PENDING_PRESIDENT',
      },
    });

    // Create individual permission requests for each student
    for (const studentId of studentIds) {
      await prisma.permissionRequest.create({
        data: {
          studentId,
          societyId,
          reason,
          date: new Date(date),
          exitTime,
          returnTime,
          status: 'PENDING_PRESIDENT',
          bulkRequestId: bulkRequest.id,
        },
      });
    }

    res.json({ success: true, bulkRequest });
  } catch (error) {
    console.error('Create bulk request error:', error);
    res.status(500).json({ error: 'Failed to create bulk request' });
  }
});

// President - Get pending bulk requests
app.get('/api/president/pending-bulk-requests/:societyId', async (req, res) => {
  try {
    const { societyId } = req.params;

    const bulkRequests = await prisma.bulkRequest.findMany({
      where: { societyId, status: 'PENDING_PRESIDENT' },
      include: {
        society: true,
        permissionRequests: { include: { student: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(bulkRequests);
  } catch (error) {
    console.error('Get bulk requests error:', error);
    res.status(500).json({ error: 'Failed to get bulk requests' });
  }
});

// President - Approve bulk request
app.post('/api/president/approve-bulk-request', async (req, res) => {
  try {
    const { bulkRequestId, action } = req.body; // action: 'approve' | 'reject'

    const newStatus = action === 'approve' ? 'PENDING_FACULTY' : 'REJECTED';

    // Update bulk request
    await prisma.bulkRequest.update({
      where: { id: bulkRequestId },
      data: { status: newStatus },
    });

    // Update all associated permission requests
    await prisma.permissionRequest.updateMany({
      where: { bulkRequestId },
      data: { status: newStatus },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Approve bulk request error:', error);
    res.status(500).json({ error: 'Failed to process bulk request' });
  }
});

// ============ ACADEMIC PERMISSIONS ============

// Admin - Create academic permission
app.post('/api/admin/academic-permissions', async (req, res) => {
  try {
    const { studentId, reason, date, department, exitTime, returnTime } = req.body;

    const permission = await prisma.academicPermission.create({
      data: {
        studentId,
        reason,
        date: new Date(date),
        department,
        exitTime,
        returnTime,
        status: 'PENDING_FACULTY',
      },
    });

    res.json(permission);
  } catch (error) {
    console.error('Create academic permission error:', error);
    res.status(500).json({ error: 'Failed to create academic permission' });
  }
});

// Admin - Get all academic permissions
app.get('/api/admin/academic-permissions', async (req, res) => {
  try {
    const permissions = await prisma.academicPermission.findMany({
      include: { student: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(permissions);
  } catch (error) {
    console.error('Get academic permissions error:', error);
    res.status(500).json({ error: 'Failed to get academic permissions' });
  }
});

// Admin - Approve academic permission (generates QR)
app.post('/api/admin/academic-permissions/approve', async (req, res) => {
  try {
    const { permissionId } = req.body;

    const permission = await prisma.academicPermission.findUnique({
      where: { id: permissionId },
      include: { student: true },
    });

    if (!permission) {
      return res.status(404).json({ error: 'Permission not found' });
    }

    // Generate QR token
    const qrToken = jwt.sign(
      {
        permissionId: permission.id,
        studentId: permission.studentId,
        type: 'ACADEMIC',
        date: permission.date.toISOString(),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
      },
      JWT_SECRET
    );

    const expiresAt = new Date(permission.date);
    expiresAt.setHours(26, 0, 0, 0);

    await prisma.academicPermission.update({
      where: { id: permissionId },
      data: {
        status: 'APPROVED',
        qrToken,
        qrGeneratedAt: new Date(),
        expiresAt,
      },
    });

    res.json({ success: true, qrToken });
  } catch (error) {
    console.error('Approve academic permission error:', error);
    res.status(500).json({ error: 'Failed to approve academic permission' });
  }
});

// ============ EB STATS ============

// Get society stats for EB dashboard
app.get('/api/eb/society-stats/:societyId', async (req, res) => {
  try {
    const { societyId } = req.params;

    // Total members
    const totalMembers = await prisma.membership.count({
      where: { societyId, status: 'APPROVED' },
    });

    // Flagged members
    const memberships = await prisma.membership.findMany({
      where: { societyId, status: 'APPROVED' },
      include: { user: true },
    });
    const flaggedMembers = memberships.filter(m => m.user.isFlagged).length;

    // Members out on night permission
    const membersOut = await prisma.permissionRequest.count({
      where: {
        societyId,
        status: 'APPROVED',
        verifiedAt: { not: null },
        checkInAt: null,
      },
    });

    res.json({
      totalMembers,
      flaggedMembers,
      membersOut,
    });
  } catch (error) {
    console.error('EB stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Get approved members for a society (for EB bulk selection)
app.get('/api/eb/approved-members/:societyId', async (req, res) => {
  try {
    const { societyId } = req.params;

    const memberships = await prisma.membership.findMany({
      where: { societyId, status: 'APPROVED' },
      include: { user: true },
    });

    const members = memberships.map(m => ({
      id: m.user.id,
      name: m.user.name,
      rollNo: m.user.rollNo,
      branch: m.user.branch,
      isFlagged: m.user.isFlagged,
      flagType: m.user.flagType,
    }));

    res.json(members);
  } catch (error) {
    console.error('Get approved members error:', error);
    res.status(500).json({ error: 'Failed to get members' });
  }
});

// ============ ADMIN PERMISSION LISTS ============

// Get permission lists by category (society/fest/academic)
app.get('/api/admin/permission-lists', async (req, res) => {
  try {
    // Society permissions (domain = SOCIETY)
    const societyPermissions = await prisma.permissionRequest.findMany({
      where: { society: { domain: 'SOCIETY' } },
      include: { student: true, society: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Fest permissions (domain = FEST)
    const festPermissions = await prisma.permissionRequest.findMany({
      where: { society: { domain: 'FEST' } },
      include: { student: true, society: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Academic permissions
    const academicPermissions = await prisma.academicPermission.findMany({
      include: { student: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // All students (for flagging/search)
    const allStudents = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        rollNo: true,
        branch: true,
        year: true,
        isFlagged: true,
        flagType: true,
        flagReason: true,
      },
      orderBy: { name: 'asc' },
    });

    res.json({
      societyPermissions,
      festPermissions,
      academicPermissions,
      allStudents,
    });
  } catch (error) {
    console.error('Permission lists error:', error);
    res.status(500).json({ error: 'Failed to get permission lists' });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
