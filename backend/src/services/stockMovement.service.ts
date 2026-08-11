import { prisma } from '../prisma/client';
import { MovementType } from '../types/enums';

export class StockMovementService {
  static async getStockMovements(params: {
    page?: number;
    limit?: number;
    productId?: string;
    movementType?: MovementType;
  }) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 15;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.productId) {
      where.productId = params.productId;
    }

    if (params.movementType) {
      where.movementType = params.movementType;
    }

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: {
          product: {
            select: { id: true, productName: true, SKU: true, currentStock: true },
          },
          createdBy: {
            select: { id: true, fullName: true, role: true },
          },
        },
      }),
      prisma.stockMovement.count({ where }),
    ]);

    return {
      movements,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
