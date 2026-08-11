import { Router } from 'express';
import { StockMovementController } from '../controllers/stockMovement.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';
import { Role } from '../types/enums';

const router = Router();

router.use(authenticateJWT);

router.get(
  '/',
  authorizeRoles(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  StockMovementController.getAll
);

export default router;
