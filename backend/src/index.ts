import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

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

app.get('/api/approvals/dosa', async (req, res) => {
  const requests = await prisma.permissionRequest.findMany({
    where: { status: 'PENDING_DOSA' },
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
