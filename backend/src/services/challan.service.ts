import { prisma } from '../prisma/client';
import { ApiError } from '../utils/apiError';
import { ChallanStatus, MovementType } from '../types/enums';

export class ChallanService {
  private static generateChallanNumber(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `CH-${timestamp}-${random}`;
  }

  static async createChallan(
    data: {
      customerId: string;
      status?: ChallanStatus;
      items: Array<{ productId: string; quantity: number }>;
    },
    createdById: string
  ) {
    const customer = await prisma.customer.findUnique({
      where: { id: data.customerId },
    });
    if (!customer) {
      throw new ApiError(404, 'Customer not found');
    }

    const productIds = data.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new ApiError(400, 'One or more selected products do not exist');
    }

    const productMap = new Map(products.map((p) => [p.id, p]));
    const requestedStatus = data.status || ChallanStatus.DRAFT;

    const challanNumber = this.generateChallanNumber();

    return await prisma.$transaction(async (tx) => {
      let totalQuantity = 0;
      let totalAmount = 0.0;

      const challanItemsData = [];

      for (const item of data.items) {
        const product = productMap.get(item.productId)!;

        if (requestedStatus === ChallanStatus.CONFIRMED) {
          if (product.currentStock < item.quantity) {
            throw new ApiError(
              400,
              `Insufficient stock for '${product.productName}'. Available: ${product.currentStock}, Requested: ${item.quantity}`
            );
          }
        }

        const subtotal = product.unitPrice * item.quantity;
        totalQuantity += item.quantity;
        totalAmount += subtotal;

        challanItemsData.push({
          productId: product.id,
          productName: product.productName,
          unitPrice: product.unitPrice,
          quantity: item.quantity,
          subtotal,
        });
      }

      const newChallan = await tx.challan.create({
        data: {
          challanNumber,
          customerId: data.customerId,
          totalQuantity,
          totalAmount,
          status: requestedStatus,
          createdById,
          items: {
            createMany: {
              data: challanItemsData,
            },
          },
        },
        include: {
          customer: true,
          items: true,
          createdBy: {
            select: { id: true, fullName: true, role: true },
          },
        },
      });

      if (requestedStatus === ChallanStatus.CONFIRMED) {
        for (const item of data.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              currentStock: { decrement: item.quantity },
            },
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantityChanged: item.quantity,
              movementType: MovementType.OUT,
              reason: `Sales Challan #${challanNumber}`,
              createdById,
            },
          });
        }
      }

      return newChallan;
    });
  }

  static async getChallans(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: ChallanStatus;
    customerId?: string;
  }) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.status) {
      where.status = params.status;
    }

    if (params.customerId) {
      where.customerId = params.customerId;
    }

    if (params.search) {
      where.OR = [
        { challanNumber: { contains: params.search } },
        { customer: { customerName: { contains: params.search } } },
        { customer: { businessName: { contains: params.search } } },
      ];
    }

    const [challans, total] = await Promise.all([
      prisma.challan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { id: true, customerName: true, businessName: true, mobileNumber: true },
          },
          createdBy: {
            select: { id: true, fullName: true, role: true },
          },
          items: true,
        },
      }),
      prisma.challan.count({ where }),
    ]);

    return {
      challans,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getChallanById(id: string) {
    const challan = await prisma.challan.findUnique({
      where: { id },
      include: {
        customer: true,
        createdBy: {
          select: { id: true, fullName: true, role: true, email: true },
        },
        items: true,
      },
    });

    if (!challan) {
      throw new ApiError(404, 'Sales Challan not found');
    }

    return challan;
  }

  static async updateChallanStatus(id: string, newStatus: ChallanStatus, userId: string) {
    const challan = await this.getChallanById(id);

    if (challan.status === newStatus) {
      return challan;
    }

    if (challan.status === ChallanStatus.CANCELLED) {
      throw new ApiError(400, 'Cannot change status of a cancelled challan');
    }

    return await prisma.$transaction(async (tx) => {
      if (challan.status === ChallanStatus.DRAFT && newStatus === ChallanStatus.CONFIRMED) {
        for (const item of challan.items) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (!product || product.currentStock < item.quantity) {
            throw new ApiError(
              400,
              `Insufficient stock for '${item.productName}'. Available: ${
                product?.currentStock || 0
              }, Required: ${item.quantity}`
            );
          }

          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { decrement: item.quantity } },
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantityChanged: item.quantity,
              movementType: MovementType.OUT,
              reason: `Sales Challan #${challan.challanNumber}`,
              createdById: userId,
            },
          });
        }
      }

      if (challan.status === ChallanStatus.CONFIRMED && newStatus === ChallanStatus.CANCELLED) {
        for (const item of challan.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { increment: item.quantity } },
          });

          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantityChanged: item.quantity,
              movementType: MovementType.IN,
              reason: `Cancelled Sales Challan #${challan.challanNumber}`,
              createdById: userId,
            },
          });
        }
      }

      const updatedChallan = await tx.challan.update({
        where: { id },
        data: { status: newStatus },
        include: {
          customer: true,
          items: true,
          createdBy: { select: { id: true, fullName: true, role: true } },
        },
      });

      return updatedChallan;
    });
  }
}
