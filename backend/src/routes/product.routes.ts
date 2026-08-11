import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import {
  createProductSchema,
  updateProductSchema,
  adjustStockSchema,
} from '../validations/product.validation';
import { Role } from '../types/enums';

const router = Router();

router.use(authenticateJWT);

router.get(
  '/',
  authorizeRoles(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  ProductController.getAll
);

router.post(
  '/',
  authorizeRoles(Role.ADMIN, Role.WAREHOUSE),
  validateRequest(createProductSchema),
  ProductController.create
);

router.get(
  '/:id',
  authorizeRoles(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  ProductController.getById
);

router.put(
  '/:id',
  authorizeRoles(Role.ADMIN, Role.WAREHOUSE),
  validateRequest(updateProductSchema),
  ProductController.update
);

router.delete(
  '/:id',
  authorizeRoles(Role.ADMIN, Role.WAREHOUSE),
  ProductController.delete
);

router.post(
  '/:id/adjust-stock',
  authorizeRoles(Role.ADMIN, Role.WAREHOUSE),
  validateRequest(adjustStockSchema),
  ProductController.adjustStock
);

export default router;
