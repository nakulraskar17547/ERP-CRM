import { prisma } from '../prisma/client';

export class DashboardService {
  static async getMetrics() {
    const [totalCustomers, totalProducts, products, recentChallans] = await Promise.all([
      prisma.customer.count(),
      prisma.product.count(),
      prisma.product.findMany({
        select: { id: true, productName: true, currentStock: true, minimumStockAlert: true, SKU: true },
      }),
      prisma.challan.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { id: true, customerName: true, businessName: true },
          },
        },
      }),
    ]);

    const lowStockProducts = products.filter((p) => p.currentStock <= p.minimumStockAlert);

    return {
      totalCustomers,
      totalProducts,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      recentChallans,
    };
  }
}
