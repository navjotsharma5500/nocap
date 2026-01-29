import { Router } from 'express';

import authRoutes from './auth.routes';
import societyRoutes from './society.routes';
import permissionRoutes from './permission.routes';
import approvalRoutes from './approval.routes';
import guardRoutes from './guard.routes';
import adminRoutes from './admin.routes';
import notificationRoutes from './notification.routes';
import ebRoutes from './eb.routes';
import presidentRoutes from './president.routes';
import studentRoutes from './student.routes';

const router = Router();

// Auth routes
router.use('/', authRoutes);

// Resource routes
router.use('/societies', societyRoutes);
router.use('/permissions', permissionRoutes);
router.use('/approvals', approvalRoutes);
router.use('/guard', guardRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/eb', ebRoutes);
router.use('/president', presidentRoutes);
router.use('/student', studentRoutes);

export default router;
