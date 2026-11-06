import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiUser } from '@/lib/auth';
import { APP_ROLES } from '@/lib/permissions';
import { handleApiError } from '@/lib/api-utils';

export async function GET() {
  const auth = await requireApiUser(APP_ROLES);
  if (!auth.ok) return auth.response;

  try {
    const warehouses = await prisma.warehouse.findMany({
      include: {
        manager: { select: { id: true, name: true } },
        _count: {
          select: { inventoryLayers: true, sourceMovements: true, destMovements: true },
        },
      },
      orderBy: { isHeadquarters: 'desc' },
    });

    return NextResponse.json({ success: true, data: warehouses });
  } catch (err) {
    return handleApiError(err, 'Fetch warehouses');
  }
}