import { PrismaClient, Role, LayerStatus, LayerSource, MovementType, CertStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('⚡ Initializing United Scale ERP Master Database...')

  await prisma.calibrationCertificate.deleteMany()
  await prisma.stockMovement.deleteMany()
  await prisma.inventoryLayer.deleteMany()
  await prisma.product.deleteMany()
  await prisma.productCategory.deleteMany()
  await prisma.warehouse.deleteMany()
  await prisma.user.deleteMany()


  const admin = await prisma.user.create({
    data: {
      name: 'Tariq Mahmood',
      email: 'admin@unitedscale.pk',
      role: Role.ADMIN,
      phone: '+92 300 1234567',
    },
  })

  const manager = await prisma.user.create({
    data: {
      name: 'Imran Khan',
      email: 'manager@unitedscale.pk',
      role: Role.MANAGER,
      phone: '+92 321 7654321',
    },
  })

  const technician = await prisma.user.create({
    data: {
      name: 'Muhammad Ali',
      email: 'technician@unitedscale.pk',
      role: Role.TECHNICIAN,
      phone: '+92 333 9876543',
    },
  })

  console.log('✓ Users created (Admin, Manager, Technician)')
  const mashriqHQ = await prisma.warehouse.create({
    data: {
      name: 'Mashriq Centre HQ',
      code: 'HQ-MASHRIQ',
      location: 'Shop #G-12, Ground Floor, Mashriq Centre, Sir Shah Suleman Road, Gulshan-e-Iqbal, Karachi',
      city: 'Karachi',
      isHeadquarters: true,
      managerId: admin.id,
    },
  })

  const gulshanGodown = await prisma.warehouse.create({
    data: {
      name: 'Gulshan Godown',
      code: 'WH-GULSHAN',
      location: 'Plot #B-44, Block 13-D, Gulshan-e-Iqbal, Karachi',
      city: 'Karachi',
      isHeadquarters: false,
      managerId: manager.id,
    },
  })

  console.log('✓ Warehouses created (Mashriq Centre HQ, Gulshan Godown)')

  const catIndicators = await prisma.productCategory.create({
    data: {
      name: 'Weighing Indicators',
      code: 'IND',
      description: 'Digital readout indicators with RS-232, LED, and LCD displays',
    },
  })

  const catLoadCells = await prisma.productCategory.create({
    data: {
      name: 'Load Cells',
      code: 'LC',
      description: 'High-precision shear beam, S-Type, and compression load cells',
    },
  })

  const catPlatformScales = await prisma.productCategory.create({
    data: {
      name: 'Platform Scales',
      code: 'PS',
      description: 'Heavy-duty mild steel and stainless steel bench and platform scales',
    },
  })

  const catCalibration = await prisma.productCategory.create({
    data: {
      name: 'Calibration Weights',
      code: 'CW',
      description: 'OIML Class M1 and F1 certified test weights for Sindh verification',
    },
  })

  console.log('✓ Product Categories created')

  const prodD900s = await prisma.product.create({
    data: {
      sku: 'IND-D900S-LCD',
      name: 'D-900s LCD Indicator',
      description: 'High-visibility backlit LCD indicator with continuous RS-232 output and peak hold',
      brand: 'Yaohua / United Scale',
      model: 'D-900s',
      capacity: 'Up to 50,000kg',
      resolution: '1/30,000 div',
      unit: 'PCS',
      hasSerialPort: true,
      rs232Protocol: '9600,8,N,1 (Continuous stream)',
      sellingPrice: 24500,
      minStockLevel: 5,
      categoryId: catIndicators.id,
    },
  })

  const prodSType = await prisma.product.create({
    data: {
      sku: 'LC-STYPE-5T',
      name: 'S-Type Load Cell',
      description: 'Alloy steel tension & compression S-Beam load cell IP67 rated',
      brand: 'Omega',
      model: 'ST-5000KG',
      capacity: '5000kg',
      resolution: '0.02% F.S.',
      unit: 'PCS',
      hasSerialPort: false,
      sellingPrice: 19800,
      minStockLevel: 4,
      categoryId: catLoadCells.id,
    },
  })

  const prodPlatform = await prisma.product.create({
    data: {
      sku: 'PS-500X600-300KG',
      name: '500X600 Platform Scale',
      description: 'Industrial 300kg platform scale with checkered top plate and RS-232 interface',
      brand: 'United Scale',
      model: 'US-PS-5060',
      capacity: '300kg',
      resolution: '10g',
      unit: 'PCS',
      hasSerialPort: true,
      rs232Protocol: '9600,8,N,1',
      sellingPrice: 58000,
      minStockLevel: 2,
      categoryId: catPlatformScales.id,
    },
  })

  const prodD60 = await prisma.product.create({
    data: {
      sku: 'IND-D60-LED',
      name: 'D-60 LED Indicator',
      description: 'Bright red 6-digit 0.8-inch LED indicator for warehouse environments',
      brand: 'Yaohua',
      model: 'D-60',
      capacity: 'Up to 30,000kg',
      resolution: '1/15,000 div',
      unit: 'PCS',
      hasSerialPort: true,
      sellingPrice: 16500,
      minStockLevel: 3,
      categoryId: catIndicators.id,
    },
  })

  console.log('✓ Products created (D-900s, S-Type Load Cell, 500X600 Scale, D-60)')


  const layer1D900 = await prisma.inventoryLayer.create({
    data: {
      productId: prodD900s.id,
      warehouseId: mashriqHQ.id,
      batchNumber: 'LOT-2026-SEP-01',
      originalQty: 20,
      remainingQty: 8,
      unitCost: 18500,
      source: LayerSource.PURCHASE,
      sourceReference: 'PO-2026-SEP-104',
      fifoDate: new Date('2026-09-15T09:00:00Z'),
      status: LayerStatus.ACTIVE,
    },
  })

  const layer2D900 = await prisma.inventoryLayer.create({
    data: {
      productId: prodD900s.id,
      warehouseId: mashriqHQ.id,
      batchNumber: 'LOT-2026-OCT-18',
      originalQty: 25,
      remainingQty: 25,
      unitCost: 19800,
      source: LayerSource.PURCHASE,
      sourceReference: 'PO-2026-OCT-220',
      fifoDate: new Date('2026-10-18T14:30:00Z'),
      status: LayerStatus.ACTIVE,
    },
  })

  const layer1SType = await prisma.inventoryLayer.create({
    data: {
      productId: prodSType.id,
      warehouseId: mashriqHQ.id,
      batchNumber: 'LOT-2026-AUG-44',
      originalQty: 15,
      remainingQty: 5,
      unitCost: 14200,
      source: LayerSource.PURCHASE,
      sourceReference: 'PO-2026-AUG-088',
      fifoDate: new Date('2026-08-20T11:00:00Z'),
      status: LayerStatus.ACTIVE,
    },
  })

  const layer2SType = await prisma.inventoryLayer.create({
    data: {
      productId: prodSType.id,
      warehouseId: gulshanGodown.id,
      batchNumber: 'LOT-2026-OCT-09',
      originalQty: 30,
      remainingQty: 30,
      unitCost: 15100,
      source: LayerSource.PURCHASE,
      sourceReference: 'PO-2026-OCT-155',
      fifoDate: new Date('2026-10-09T16:00:00Z'),
      status: LayerStatus.ACTIVE,
    },
  })
  const layer1Platform = await prisma.inventoryLayer.create({
    data: {
      productId: prodPlatform.id,
      warehouseId: mashriqHQ.id,
      batchNumber: 'LOT-2026-SEP-77',
      originalQty: 10,
      remainingQty: 4,
      unitCost: 42000,
      source: LayerSource.PURCHASE,
      sourceReference: 'PO-2026-SEP-301',
      fifoDate: new Date('2026-09-28T10:00:00Z'),
      status: LayerStatus.ACTIVE,
    },
  })

  const layer2Platform = await prisma.inventoryLayer.create({
    data: {
      productId: prodPlatform.id,
      warehouseId: gulshanGodown.id,
      batchNumber: 'LOT-2026-OCT-30',
      originalQty: 12,
      remainingQty: 12,
      unitCost: 44500,
      source: LayerSource.PURCHASE,
      sourceReference: 'PO-2026-OCT-410',
      fifoDate: new Date('2026-10-30T13:00:00Z'),
      status: LayerStatus.ACTIVE,
    },
  })

  console.log('✓ Strict FIFO Inventory Layers established')

  await prisma.stockMovement.create({
    data: {
      reference: 'MOV-20260915-001',
      type: MovementType.PURCHASE,
      productId: prodD900s.id,
      quantity: 20,
      unitCost: 18500,
      totalCost: 370000,
      inventoryLayerId: layer1D900.id,
      destWarehouseId: mashriqHQ.id,
      performedById: manager.id,
      reason: 'Procurement shipment received at Mashriq Centre',
      notes: 'Import invoice US-IMP-9812 verified',
      createdAt: new Date('2026-09-15T09:30:00Z'),
    },
  })

  await prisma.stockMovement.create({
    data: {
      reference: 'MOV-20261002-014',
      type: MovementType.SALE_DEDUCTION,
      productId: prodD900s.id,
      quantity: 12,
      unitCost: 18500,
      totalCost: 222000,
      inventoryLayerId: layer1D900.id,
      sourceWarehouseId: mashriqHQ.id,
      performedById: admin.id,
      reason: 'Sale Invoice SI-2026-1088 (Lucky Cement Karachi Terminal)',
      notes: 'Deducted from FIFO Layer LOT-2026-SEP-01',
      createdAt: new Date('2026-10-02T15:20:00Z'),
    },
  })

  console.log('Stock Movements audit trail generated')


  await prisma.calibrationCertificate.create({
    data: {
      certificateNumber: 'US-CAL-SINDH-2026-089',
      govtSindhVerificationNo: 'SINDH-WM-KHI-2026-4421',
      clientName: 'Lucky Cement Limited (Karachi Plant)',
      clientAddress: 'Main Super Highway, Gadap Town, Karachi',
      clientContact: '+92 21 34567890 (Engr. Asif Naveed)',
      productId: prodPlatform.id,
      equipmentModel: '500X600 Platform Scale + D-900s Indicator',
      serialNumber: 'SN-2026-US-8921',
      nominalCapacity: 300,
      readability: 0.01,
      calibrationDate: new Date('2026-10-15T10:00:00Z'),
      nextDueDate: new Date('2027-10-14T23:59:59Z'),
      environmentalTemp: 26.2,
      environmentalHumidity: 54,
      standardWeightUsed: 'Class M1 Stainless Steel Mass Standards (US-STD-M1-20, Sindh Reg #55)',
      status: CertStatus.APPROVED_GOVT_SINDH,
      inspectorTechnicianId: technician.id,
      notes: 'Govt. of Sindh Inspector stamped and sealed lead verification wire.',
      calibrationResults: {
        zeroError: 0.0,
        repeatabilityMaxError: 0.01,
        eccentricityMaxError: 0.01,
        linearityPoints: [
          { applied: 50, indicated: 50.0, error: 0.0 },
          { applied: 100, indicated: 100.0, error: 0.0 },
          { applied: 200, indicated: 200.01, error: 0.01 },
          { applied: 300, indicated: 300.0, error: 0.0 },
        ],
      },
    },
  })

  console.log('Sindh Govt Calibration Certificate seeded')
  console.log('Seeding complete! United Scale ERP is operational.')
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

