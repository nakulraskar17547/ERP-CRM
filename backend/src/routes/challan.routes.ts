import { Router } from 'express';
import { ChallanController } from '../controllers/challan.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import {
  createChallanSchema,
  updateChallanStatusSchema,
} from '../validations/challan.validation';
import { Role } from '../types/enums';

const router = Router();

router.use(authenticateJWT);

router.get(
  '/',
  authorizeRoles(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  ChallanController.getAll
);

router.post(
  '/',
  authorizeRoles(Role.ADMIN, Role.SALES),
  validateRequest(createChallanSchema),
  ChallanController.create
);

router.get(
  '/:id',
  authorizeRoles(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  ChallanController.getById
);

router.put(
  '/:id/status',
  authorizeRoles(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  validateRequest(updateChallanStatusSchema),
  ChallanController.updateStatus
);

export default router;
