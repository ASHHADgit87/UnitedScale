import { Prisma, LayerStatus, MovementType, LayerSource } from '@prisma/client'
import { prisma } from './prisma'

export interface DeductStockParams {
  productId: string
  warehouseId: string
  quantity: number | string | Prisma.Decimal
  performedById?: string
  referencePrefix?: string
  movementType?: MovementType
  reason?: string
  notes?: string
}

export interface LayerDeductionDetail {
  layerId: string
  batchNumber: string | null
  fifoDate: Date
  unitCost: Prisma.Decimal
  deductedQty: Prisma.Decimal
  subtotalCost: Prisma.Decimal
  remainingQtyAfter: Prisma.Decimal
  layerDepleted: boolean
}

export interface FifoDeductionResult {
  success: boolean
  productId: string
  warehouseId: string
  totalDeductedQty: Prisma.Decimal
  totalCostOfGoodsSold: Prisma.Decimal
  averageUnitCost: Prisma.Decimal
  deductions: LayerDeductionDetail[]
  stockMovementIds: string[]
  completedAt: Date
}

export interface AddStockParams {
  productId: string
  warehouseId: string
  quantity: number | string | Prisma.Decimal
  unitCost: number | string | Prisma.Decimal
  batchNumber?: string
  source?: LayerSource
  sourceReference?: string
  fifoDate?: Date
  performedById?: string
  notes?: string
}

export interface TransferStockParams {
  productId: string
  fromWarehouseId: string
  toWarehouseId: string
  quantity: number | string | Prisma.Decimal
  performedById?: string
  transferReference?: string
  notes?: string
}

export class InsufficientStockError extends Error {
  productId: string
  warehouseId: string
  requestedQty: number
  availableQty: number

  constructor(productId: string, warehouseId: string, requestedQty: number, availableQty: number) {
    super(
      `Insufficient stock for Product ID "${productId}" in Warehouse "${warehouseId}". Requested: ${requestedQty}, Available in active FIFO layers: ${availableQty}`
    )
    this.name = 'InsufficientStockError'
    this.productId = productId
    this.warehouseId = warehouseId
    this.requestedQty = requestedQty
    this.availableQty = availableQty
  }
}

function generateReference(prefix: string): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString(36).toUpperCase()
  return `${prefix}-${timestamp}-${randomSuffix}`
}

export async function deductStock(
  params: DeductStockParams,
  externalTx?: Prisma.TransactionClient
): Promise<FifoDeductionResult> {
  const executeDeduction = async (tx: Prisma.TransactionClient): Promise<FifoDeductionResult> => {
    const qtyNeeded = new Prisma.Decimal(params.quantity.toString())

    if (qtyNeeded.lte(0)) {
      throw new Error(`Deduction quantity must be strictly greater than 0. Received: ${params.quantity}`)
    }

    const product = await tx.product.findUnique({
      where: { id: params.productId },
      select: { id: true, name: true, sku: true },
    })
    if (!product) {
      throw new Error(`Product with ID "${params.productId}" not found.`)
    }

    const warehouse = await tx.warehouse.findUnique({
      where: { id: params.warehouseId },
      select: { id: true, name: true, code: true },
    })
    if (!warehouse) {
      throw new Error(`Warehouse with ID "${params.warehouseId}" not found.`)
    }

    const activeLayers = await tx.inventoryLayer.findMany({
      where: {
        productId: params.productId,
        warehouseId: params.warehouseId,
        status: LayerStatus.ACTIVE,
        remainingQty: { gt: 0 },
      },
      orderBy: {
        fifoDate: 'asc',
      },
    })

    const totalAvailable = activeLayers.reduce(
      (sum, layer) => sum.plus(layer.remainingQty),
      new Prisma.Decimal(0)
    )

    if (totalAvailable.lt(qtyNeeded)) {
      throw new InsufficientStockError(
        params.productId,
        params.warehouseId,
        qtyNeeded.toNumber(),
        totalAvailable.toNumber()
      )
    }

    let remainingToDeduct = new Prisma.Decimal(qtyNeeded)
    let totalCOGS = new Prisma.Decimal(0)
    const deductions: LayerDeductionDetail[] = []
    const stockMovementIds: string[] = []
    const movementType = params.movementType ?? MovementType.SALE_DEDUCTION
    const refPrefix = params.referencePrefix ?? 'MOV-OUT'

    for (const layer of activeLayers) {
      if (remainingToDeduct.lte(0)) break

      const availableInLayer = new Prisma.Decimal(layer.remainingQty)
      const qtyToTake = Prisma.Decimal.min(availableInLayer, remainingToDeduct)
      const newRemaining = availableInLayer.minus(qtyToTake)
      const isDepleted = newRemaining.equals(0)
      const subtotalCost = qtyToTake.mul(layer.unitCost)

      totalCOGS = totalCOGS.plus(subtotalCost)

      await tx.inventoryLayer.update({
        where: { id: layer.id },
        data: {
          remainingQty: newRemaining,
          status: isDepleted ? LayerStatus.DEPLETED : LayerStatus.ACTIVE,
        },
      })

      const movementRef = generateReference(refPrefix)
      const movement = await tx.stockMovement.create({
        data: {
          reference: movementRef,
          type: movementType,
          productId: params.productId,
          quantity: qtyToTake,
          unitCost: layer.unitCost,
          totalCost: subtotalCost,
          inventoryLayerId: layer.id,
          sourceWarehouseId: params.warehouseId,
          destWarehouseId: null,
          performedById: params.performedById,
          reason: params.reason ?? `FIFO deduction from Layer ${layer.batchNumber || layer.id}`,
          notes: params.notes,
        },
      })

      stockMovementIds.push(movement.id)

      deductions.push({
        layerId: layer.id,
        batchNumber: layer.batchNumber,
        fifoDate: layer.fifoDate,
        unitCost: layer.unitCost,
        deductedQty: qtyToTake,
        subtotalCost: subtotalCost,
        remainingQtyAfter: newRemaining,
        layerDepleted: isDepleted,
      })

      remainingToDeduct = remainingToDeduct.minus(qtyToTake)
    }

    const averageUnitCost = totalCOGS.div(qtyNeeded)

    return {
      success: true,
      productId: params.productId,
      warehouseId: params.warehouseId,
      totalDeductedQty: qtyNeeded,
      totalCostOfGoodsSold: totalCOGS,
      averageUnitCost,
      deductions,
      stockMovementIds,
      completedAt: new Date(),
    }
  }

  if (externalTx) {
    return executeDeduction(externalTx)
  } else {
    return prisma.$transaction(async (tx) => executeDeduction(tx), {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 5000,
      timeout: 10000,
    })
  }
}

export async function addStockLayer(
  params: AddStockParams,
  externalTx?: Prisma.TransactionClient
) {
  const executeAdd = async (tx: Prisma.TransactionClient) => {
    const qty = new Prisma.Decimal(params.quantity.toString())
    const cost = new Prisma.Decimal(params.unitCost.toString())

    if (qty.lte(0)) {
      throw new Error(`Inflow stock quantity must be strictly greater than 0. Received: ${params.quantity}`)
    }
    if (cost.lt(0)) {
      throw new Error(`Unit cost cannot be negative. Received: ${params.unitCost}`)
    }

    const source = params.source ?? LayerSource.PURCHASE
    const fifoDate = params.fifoDate ?? new Date()
    const batchNumber =
      params.batchNumber ??
      `BATCH-${fifoDate.toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`

    const layer = await tx.inventoryLayer.create({
      data: {
        productId: params.productId,
        warehouseId: params.warehouseId,
        originalQty: qty,
        remainingQty: qty,
        unitCost: cost,
        batchNumber,
        source,
        sourceReference: params.sourceReference,
        fifoDate,
        status: LayerStatus.ACTIVE,
      },
    })

    const movementType =
      source === LayerSource.OPENING_STOCK
        ? MovementType.OPENING_STOCK
        : MovementType.PURCHASE

    const movement = await tx.stockMovement.create({
      data: {
        reference: generateReference(source === LayerSource.OPENING_STOCK ? 'MOV-OPEN' : 'MOV-IN'),
        type: movementType,
        productId: params.productId,
        quantity: qty,
        unitCost: cost,
        totalCost: qty.mul(cost),
        inventoryLayerId: layer.id,
        sourceWarehouseId: null,
        destWarehouseId: params.warehouseId,
        performedById: params.performedById,
        reason: `Inflow layer created from ${source} (${params.sourceReference || 'N/A'})`,
        notes: params.notes,
      },
    })

    return {
      layer,
      movement,
    }
  }

  if (externalTx) {
    return executeAdd(externalTx)
  } else {
    return prisma.$transaction(async (tx) => executeAdd(tx), {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    })
  }
}

export async function transferStock(params: TransferStockParams) {
  if (params.fromWarehouseId === params.toWarehouseId) {
    throw new Error('Source warehouse and destination warehouse cannot be identical.')
  }

  return prisma.$transaction(
    async (tx) => {
      const transferRef = params.transferReference ?? generateReference('TRF')

      const deductionResult = await deductStock(
        {
          productId: params.productId,
          warehouseId: params.fromWarehouseId,
          quantity: params.quantity,
          performedById: params.performedById,
          referencePrefix: 'TRF-OUT',
          movementType: MovementType.TRANSFER_OUT,
          reason: `Transfer outward to warehouse ${params.toWarehouseId} [Ref: ${transferRef}]`,
          notes: params.notes,
        },
        tx
      )

      const createdDestLayers = []
      const inwardMovements = []

      for (const item of deductionResult.deductions) {
        const destLayer = await tx.inventoryLayer.create({
          data: {
            productId: params.productId,
            warehouseId: params.toWarehouseId,
            originalQty: item.deductedQty,
            remainingQty: item.deductedQty,
            unitCost: item.unitCost,
            batchNumber: item.batchNumber
              ? `${item.batchNumber}-TRF`
              : `TRF-${Date.now().toString(36).toUpperCase()}`,
            source: LayerSource.TRANSFER_IN,
            sourceReference: transferRef,
            fifoDate: item.fifoDate,
            status: LayerStatus.ACTIVE,
          },
        })

        const inMovement = await tx.stockMovement.create({
          data: {
            reference: generateReference('TRF-IN'),
            type: MovementType.TRANSFER_IN,
            productId: params.productId,
            quantity: item.deductedQty,
            unitCost: item.unitCost,
            totalCost: item.subtotalCost,
            inventoryLayerId: destLayer.id,
            sourceWarehouseId: params.fromWarehouseId,
            destWarehouseId: params.toWarehouseId,
            performedById: params.performedById,
            reason: `Transfer inward from warehouse ${params.fromWarehouseId} [Ref: ${transferRef}]`,
            notes: params.notes,
          },
        })

        createdDestLayers.push(destLayer)
        inwardMovements.push(inMovement)
      }

      return {
        success: true,
        transferReference: transferRef,
        sourceWarehouseId: params.fromWarehouseId,
        destinationWarehouseId: params.toWarehouseId,
        totalQuantityTransferred: deductionResult.totalDeductedQty,
        totalValuationTransferred: deductionResult.totalCostOfGoodsSold,
        averageUnitCost: deductionResult.averageUnitCost,
        layersDeducted: deductionResult.deductions,
        layersCreated: createdDestLayers,
      }
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 5000,
      timeout: 10000,
    }
  )
}

export async function getWarehouseStockValuation(productId: string, warehouseId: string) {
  const activeLayers = await prisma.inventoryLayer.findMany({
    where: {
      productId,
      warehouseId,
      status: LayerStatus.ACTIVE,
      remainingQty: { gt: 0 },
    },
    orderBy: {
      fifoDate: 'asc',
    },
  })

  let totalQty = new Prisma.Decimal(0)
  let totalValuation = new Prisma.Decimal(0)

  for (const layer of activeLayers) {
    totalQty = totalQty.plus(layer.remainingQty)
    totalValuation = totalValuation.plus(layer.remainingQty.mul(layer.unitCost))
  }

  const weightedAverageUnitCost = totalQty.gt(0)
    ? totalValuation.div(totalQty)
    : new Prisma.Decimal(0)

  return {
    productId,
    warehouseId,
    totalRemainingQty: totalQty,
    totalValuationPKR: totalValuation,
    weightedAverageCost: weightedAverageUnitCost,
    activeLayerCount: activeLayers.length,
    layers: activeLayers,
  }
}