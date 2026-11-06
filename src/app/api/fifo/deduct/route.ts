import { NextRequest, NextResponse } from 'next/server';
import { deductStock } from '@/lib/fifo-engine';
import { requireApiUser } from '@/lib/auth';
import { OFFICE_ROLES } from '@/lib/permissions';
import { clip, fail, handleApiError, isId, parseQuantity } from '@/lib/api-utils';

export async function POST(req: NextRequest) {
  const auth = await requireApiUser(OFFICE_ROLES);
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const quantity = parseQuantity(body?.quantity);

  if (!isId(body?.productId) || !isId(body?.warehouseId) || quantity === null) {
    return fail(400, 'INVALID_INPUT', 'productId, warehouseId and a positive quantity are required.');
  }

  try {
    const result = await deductStock({
      productId: body.productId,
      warehouseId: body.warehouseId,
      quantity,
      performedById: auth.user.id,
      reason: clip(body.reason) ?? 'Sales order',
      notes: clip(body.notes),
    });

    return NextResponse.json({
      success: true,
      message: `Sold ${quantity} units, costed from the oldest stock first.`,
      data: result,
    });
  } catch (err) {
    return handleApiError(err, 'Stock deduction');
  }
}