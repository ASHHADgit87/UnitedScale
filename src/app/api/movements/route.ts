import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiUser } from '@/lib/auth';
import { OFFICE_ROLES } from '@/lib/permissions';
import { handleApiError, isId } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  const auth = await requireApiUser(OFFICE_ROLES);
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const productParam = searchParams.get('productId');
    const productId = isId(productParam) ? productParam : undefined;
    const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 50, 1), 200);

    const movements = await prisma.stockMovement.findMany({
      where: productId ? { productId } : undefined,
      include: {
        product: { select: { id: true, sku: true, name: true, unit: true } },
        sourceWarehouse: { select: { id: true, name: true, code: true } },
        destWarehouse: { select: { id: true, name: true, code: true } },
        inventoryLayer: { select: { id: true, batchNumber: true, fifoDate: true, unitCost: true } },
        performedBy: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ success: true, count: movements.length, data: movements });
  } catch (err) {
    return handleApiError(err, 'Fetch stock movements');
  }
}