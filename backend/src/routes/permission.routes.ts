import { Router } from 'express';
import { permissionController } from '../controllers/permission.controller';

const router = Router();

router.post('/', (req, res) => permissionController.create(req, res));
router.get('/student/:studentId', (req, res) => permissionController.getByStudent(req, res));

export default router;
