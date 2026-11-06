import { NextRequest, NextResponse } from 'next/server';
import { transferStock } from '@/lib/fifo-engine';
import { requireApiUser } from '@/lib/auth';
import { OFFICE_ROLES } from '@/lib/permissions';
import { clip, fail, handleApiError, isId, parseQuantity } from '@/lib/api-utils';

export async function POST(req: NextRequest) {
  const auth = await requireApiUser(OFFICE_ROLES);
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const quantity = parseQuantity(body?.quantity);

  if (
    !isId(body?.productId) ||
    !isId(body?.fromWarehouseId) ||
    !isId(body?.toWarehouseId) ||
    quantity === null
  ) {
    return fail(
      400,
      'INVALID_INPUT',
      'productId, fromWarehouseId, toWarehouseId and a positive quantity are required.',
    );
  }

  if (body.fromWarehouseId === body.toWarehouseId) {
    return fail(400, 'INVALID_INPUT', 'Source and destination must be different locations.');
  }

  try {
    const result = await transferStock({
      productId: body.productId,
      fromWarehouseId: body.fromWarehouseId,
      toWarehouseId: body.toWarehouseId,
      quantity,
      performedById: auth.user.id,
      notes: clip(body.notes),
    });

    return NextResponse.json({ success: true, message: 'Transfer completed.', data: result });
  } catch (err) {
    return handleApiError(err, 'Stock transfer');
  }
}