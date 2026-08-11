import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { prisma } from './prisma/client';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL database via Prisma ORM.');

    app.listen(PORT, () => {
      console.log(`🚀 Mini ERP + CRM Backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start backend server:', error);
    process.exit(1);
  }
}

startServer();
