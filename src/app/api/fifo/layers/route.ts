import { NextRequest, NextResponse } from 'next/server';
import { LayerStatus } from '@prisma/client';
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
    const warehouseParam = searchParams.get('warehouseId');
    const statusParam = searchParams.get('status');

    const productId = isId(productParam) ? productParam : undefined;
    const warehouseId = isId(warehouseParam) ? warehouseParam : undefined;
    const status =
      statusParam === 'ACTIVE'
        ? LayerStatus.ACTIVE
        : statusParam === 'DEPLETED'
          ? LayerStatus.DEPLETED
          : undefined;

    const layers = await prisma.inventoryLayer.findMany({
      where: {
        ...(productId ? { productId } : {}),
        ...(warehouseId ? { warehouseId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        product: { select: { id: true, sku: true, name: true, brand: true, unit: true } },
        warehouse: { select: { id: true, name: true, code: true, isHeadquarters: true } },
      },
      orderBy: { fifoDate: 'asc' },
      take: 500,
    });

    return NextResponse.json({ success: true, count: layers.length, data: layers });
  } catch (err) {
    return handleApiError(err, 'Fetch stock batches');
  }
}