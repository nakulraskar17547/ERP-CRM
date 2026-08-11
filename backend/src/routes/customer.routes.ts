import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import {
  createCustomerSchema,
  updateCustomerSchema,
  addNoteSchema,
} from '../validations/customer.validation';
import { Role } from '../types/enums';

const router = Router();

router.use(authenticateJWT);

router.get(
  '/',
  authorizeRoles(Role.ADMIN, Role.SALES, Role.ACCOUNTS),
  CustomerController.getAll
);

router.post(
  '/',
  authorizeRoles(Role.ADMIN, Role.SALES, Role.ACCOUNTS),
  validateRequest(createCustomerSchema),
  CustomerController.create
);

router.get(
  '/:id',
  authorizeRoles(Role.ADMIN, Role.SALES, Role.ACCOUNTS),
  CustomerController.getById
);

router.put(
  '/:id',
  authorizeRoles(Role.ADMIN, Role.SALES, Role.ACCOUNTS),
  validateRequest(updateCustomerSchema),
  CustomerController.update
);

router.delete(
  '/:id',
  authorizeRoles(Role.ADMIN, Role.SALES),
  CustomerController.delete
);

router.post(
  '/:id/notes',
  authorizeRoles(Role.ADMIN, Role.SALES, Role.ACCOUNTS),
  validateRequest(addNoteSchema),
  CustomerController.addNote
);

export default router;
