import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { prisma } from './lib/prisma';

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

app.use(cors());
app.use(express.json());

// Mock Auth Middleware
const mockAuth = (req: any, res: any, next: any) => {
  // In a real app, verify JWT. Here we'll just trust a header for the prototype
  const userId = req.headers['x-user-id'];
  if (userId) {
    req.user = { id: userId };
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
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && user.password === password) {
      res.json(user);
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// 2. Societies
app.get('/api/societies', async (req, res) => {
  const societies = await prisma.society.findMany();
  res.json(societies);
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
    const request = await prisma.permissionRequest.create({
      data: {
        studentId,
        societyId,
        reason,
        date: new Date(date),
        exitTime,
        returnTime,
        status: 'PENDING_PRESIDENT',
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

// 5. Approval Workflow (President -> DoSA)
app.get('/api/approvals/president/:societyId', async (req, res) => {
  const { societyId } = req.params;
  const requests = await prisma.permissionRequest.findMany({
    where: { societyId, status: 'PENDING_PRESIDENT' },
    include: { student: true },
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

// Guard - Verify QR Code at Gate
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

    // Check if already verified
    if (request.verifiedAt) {
      return res.json({
        success: false,
        message: 'Pass already used',
        verifiedAt: request.verifiedAt.toLocaleString(),
      });
    }

    // Check expiry
    if (request.expiresAt && new Date() > request.expiresAt) {
      return res.json({ success: false, message: 'Pass expired' });
    }

    // Check status
    if (request.status !== 'APPROVED') {
      return res.json({ success: false, message: 'Pass not approved' });
    }

    // Mark as verified
    await prisma.permissionRequest.update({
      where: { id: request.id },
      data: {
        verifiedAt: new Date(),
        verifiedBy: guardId || 'guard-unknown',
      },
    });

    res.json({
      success: true,
      message: 'Student verified successfully',
      student: {
        name: request.student.name,
        rollNo: request.student.rollNo,
        hostel: request.student.branch ? `${request.student.branch}-Block` : 'Unknown',
        reason: request.reason,
        validUntil: request.expiresAt?.toLocaleString() || 'N/A',
        society: request.society.name,
        exitTime: request.exitTime,
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
    where: { status: 'PENDING_FACULTY' },
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


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
