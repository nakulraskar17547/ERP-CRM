import { prisma } from '../prisma/client';
import { ApiError } from '../utils/apiError';
import { CustomerType, CustomerStatus } from '../types/enums';

export class CustomerService {
  static async createCustomer(data: any) {
    const customer = await prisma.customer.create({
      data: {
        customerName: data.customerName,
        mobileNumber: data.mobileNumber,
        email: data.email || null,
        businessName: data.businessName,
        gstNumber: data.gstNumber || null,
        customerType: data.customerType || CustomerType.WHOLESALE,
        address: data.address,
        status: data.status || CustomerStatus.LEAD,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
        notes: data.notes || null,
      },
    });
    return customer;
  }

  static async getCustomers(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: CustomerStatus;
    customerType?: CustomerType;
  }) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.status) {
      where.status = params.status;
    }

    if (params.customerType) {
      where.customerType = params.customerType;
    }

    if (params.search) {
      where.OR = [
        { customerName: { contains: params.search } },
        { businessName: { contains: params.search } },
        { mobileNumber: { contains: params.search } },
        { email: { contains: params.search } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customer.count({ where }),
    ]);

    return {
      customers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getCustomerById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        challans: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!customer) {
      throw new ApiError(404, 'Customer not found');
    }

    return customer;
  }

  static async updateCustomer(id: string, data: any) {
    await this.getCustomerById(id);

    const updateData: any = { ...data };
    if (data.followUpDate) {
      updateData.followUpDate = new Date(data.followUpDate);
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: updateData,
    });

    return updatedCustomer;
  }

  static async deleteCustomer(id: string) {
    await this.getCustomerById(id);

    await prisma.customer.delete({
      where: { id },
    });

    return { id };
  }

  static async addFollowUpNote(id: string, note: string, followUpDate?: string | null) {
    const customer = await this.getCustomerById(id);

    const existingNotes = customer.notes ? customer.notes + '\n---\n' : '';
    const timeStamp = new Date().toISOString().split('T')[0];
    const newNoteFormatted = `[${timeStamp}] ${note}`;

    const updateData: any = {
      notes: existingNotes + newNoteFormatted,
    };

    if (followUpDate) {
      updateData.followUpDate = new Date(followUpDate);
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: updateData,
    });

    return updatedCustomer;
  }
}
