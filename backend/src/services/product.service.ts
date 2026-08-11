import { prisma } from '../prisma/client';
import { ApiError } from '../utils/apiError';
import { MovementType } from '../types/enums';

export class ProductService {
  static async createProduct(data: any, createdById: string) {
    const existingSKU = await prisma.product.findUnique({
      where: { SKU: data.SKU },
    });

    if (existingSKU) {
      throw new ApiError(409, `Product with SKU '${data.SKU}' already exists`);
    }

    const initialStock = data.currentStock || 0;

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          productName: data.productName,
          SKU: data.SKU,
          category: data.category,
          unitPrice: data.unitPrice,
          currentStock: initialStock,
          minimumStockAlert: data.minimumStockAlert ?? 10,
          warehouseLocation: data.warehouseLocation,
        },
      });

      if (initialStock > 0) {
        await tx.stockMovement.create({
          data: {
            productId: product.id,
            quantityChanged: initialStock,
            movementType: MovementType.IN,
            reason: 'Initial Stock Setup',
            createdById,
          },
        });
      }

      return product;
    });

    return result;
  }

  static async getProducts(params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    lowStockOnly?: boolean;
  }) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.category) {
      where.category = params.category;
    }

    if (params.search) {
      where.OR = [
        { productName: { contains: params.search } },
        { SKU: { contains: params.search } },
        { category: { contains: params.search } },
      ];
    }

    let products = await prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    if (params.lowStockOnly) {
      products = products.filter((p) => p.currentStock <= p.minimumStockAlert);
    }

    const total = await prisma.product.count({ where });

    return {
      products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stockMovements: {
          orderBy: { timestamp: 'desc' },
          take: 10,
          include: {
            createdBy: {
              select: { id: true, fullName: true, role: true },
            },
          },
        },
      },
    });

    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    return product;
  }

  static async updateProduct(id: string, data: any) {
    await this.getProductById(id);

    if (data.SKU) {
      const existing = await prisma.product.findUnique({ where: { SKU: data.SKU } });
      if (existing && existing.id !== id) {
        throw new ApiError(409, `Product with SKU '${data.SKU}' already exists`);
      }
    }

    const { currentStock, ...safeUpdateData } = data;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: safeUpdateData,
    });

    return updatedProduct;
  }

  static async deleteProduct(id: string) {
    await this.getProductById(id);

    await prisma.product.delete({
      where: { id },
    });

    return { id };
  }

  static async adjustStock(
    id: string,
    quantityChanged: number,
    movementType: MovementType,
    reason: string,
    createdById: string
  ) {
    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id } });
      if (!product) {
        throw new ApiError(404, 'Product not found');
      }

      let newStock = product.currentStock;
      if (movementType === MovementType.IN) {
        newStock += quantityChanged;
      } else if (movementType === MovementType.OUT) {
        if (product.currentStock < quantityChanged) {
          throw new ApiError(
            400,
            `Insufficient stock for '${product.productName}'. Available: ${product.currentStock}, Requested: ${quantityChanged}`
          );
        }
        newStock -= quantityChanged;
      }

      const updatedProduct = await tx.product.update({
        where: { id },
        data: { currentStock: newStock },
      });

      const movement = await tx.stockMovement.create({
        data: {
          productId: id,
          quantityChanged,
          movementType,
          reason,
          createdById,
        },
      });

      return { product: updatedProduct, movement };
    });
  }
}
