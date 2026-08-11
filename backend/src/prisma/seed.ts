import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Role, CustomerType, CustomerStatus } from '../types/enums';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding ManageX ERP/CRM database with updated staff names...');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  // 1. ADMIN -> Nakul
  await prisma.user.upsert({
    where: { email: 'admin@erp.com' },
    update: {
      fullName: 'Nakul',
    },
    create: {
      email: 'admin@erp.com',
      password: hashedPassword,
      fullName: 'Nakul',
      role: Role.ADMIN,
    },
  });

  // 2. SALES -> Rajveer
  await prisma.user.upsert({
    where: { email: 'sales@erp.com' },
    update: {
      fullName: 'Rajveer',
    },
    create: {
      email: 'sales@erp.com',
      password: hashedPassword,
      fullName: 'Rajveer',
      role: Role.SALES,
    },
  });

  // 3. WAREHOUSE -> Pawan
  await prisma.user.upsert({
    where: { email: 'warehouse@erp.com' },
    update: {
      fullName: 'Pawan',
    },
    create: {
      email: 'warehouse@erp.com',
      password: hashedPassword,
      fullName: 'Pawan',
      role: Role.WAREHOUSE,
    },
  });

  // 4. ACCOUNTS -> Satakshi
  await prisma.user.upsert({
    where: { email: 'accounts@erp.com' },
    update: {
      fullName: 'Satakshi',
    },
    create: {
      email: 'accounts@erp.com',
      password: hashedPassword,
      fullName: 'Satakshi',
      role: Role.ACCOUNTS,
    },
  });

  console.log('✅ Staff users updated: Nakul (Admin), Rajveer (Sales), Pawan (Warehouse), Satakshi (Accounts).');

  // Sample Customers
  await prisma.customer.upsert({
    where: { id: 'c1111111-1111-1111-1111-111111111111' },
    update: {},
    create: {
      id: 'c1111111-1111-1111-1111-111111111111',
      customerName: 'Aarav Sharma',
      mobileNumber: '+919876543210',
      email: 'aarav@apexdistributors.com',
      businessName: 'Apex Wholesale & Distribution',
      gstNumber: '27AAAAA0000A1Z5',
      customerType: CustomerType.DISTRIBUTOR,
      address: 'Plot 45, GIDC Industrial Estate, Ahmedabad, Gujarat',
      status: CustomerStatus.ACTIVE,
      notes: '[2026-08-01] Interested in bulk purchases of industrial components.',
    },
  });

  await prisma.customer.upsert({
    where: { id: 'c2222222-2222-2222-2222-222222222222' },
    update: {},
    create: {
      id: 'c2222222-2222-2222-2222-222222222222',
      customerName: 'Pooja Verma',
      mobileNumber: '+919811223344',
      email: 'pooja@metrotraders.com',
      businessName: 'Metro Enterprises',
      gstNumber: '07BBBBA1111B1Z9',
      customerType: CustomerType.WHOLESALE,
      address: '102 Chandni Chowk Commercial Hub, Delhi',
      status: CustomerStatus.LEAD,
      notes: '[2026-08-05] Sent product catalog. Follow-up scheduled for next week.',
    },
  });

  // Sample Products
  await prisma.product.upsert({
    where: { SKU: 'IND-PNL-001' },
    update: {},
    create: {
      productName: 'Heavy Duty Control Panel Box 400x500',
      SKU: 'IND-PNL-001',
      category: 'Electrical Components',
      unitPrice: 3500.0,
      currentStock: 45,
      minimumStockAlert: 10,
      warehouseLocation: 'Rack A-04, Sector 2',
    },
  });

  await prisma.product.upsert({
    where: { SKU: 'WIR-COP-050' },
    update: {},
    create: {
      productName: 'Industrial Copper Cable (50 Meter Roll)',
      SKU: 'WIR-COP-050',
      category: 'Wiring & Cables',
      unitPrice: 2200.0,
      currentStock: 5,
      minimumStockAlert: 15,
      warehouseLocation: 'Rack B-12, Sector 1',
    },
  });

  await prisma.product.upsert({
    where: { SKU: 'SWT-LVR-010' },
    update: {},
    create: {
      productName: 'Heavy Duty Toggle Switch 10A',
      SKU: 'SWT-LVR-010',
      category: 'Switches',
      unitPrice: 180.0,
      currentStock: 200,
      minimumStockAlert: 50,
      warehouseLocation: 'Bin C-01, Sector 3',
    },
  });
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
