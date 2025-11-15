import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      id: 'user-admin',
      name: 'Foundanen Tuo',
      email: 'foundanen.tuo@devsongue.com',
      password: 'Devsongue61996@@', // Mot de passe en clair comme demandé
      role: 'ADMIN',
      status: 'ACTIVE',
      avatarUrl: 'https://i.pravatar.cc/150?u=admin',
      lastLogin: new Date(),
    },
  });

  // Create manager users
  const saidUser = await prisma.user.create({
    data: {
      id: 'user-said',
      name: 'Said',
      email: 'said@devsongue.com',
      password: 'S@ide25', // Mot de passe en clair comme demandé
      role: 'MANAGER',
      status: 'ACTIVE',
      avatarUrl: 'https://i.pravatar.cc/150?u=said',
      lastLogin: new Date(),
    },
  });

  const mariamUser = await prisma.user.create({
    data: {
      id: 'user-mariam',
      name: 'Mariam',
      email: 'mariam@devsongue.com',
      password: 'M@ariam25', // Mot de passe en clair comme demandé
      role: 'MANAGER',
      status: 'ACTIVE',
      avatarUrl: 'https://i.pravatar.cc/150?u=mariam',
      lastLogin: new Date(),
    },
  });

  const lucreceUser = await prisma.user.create({
    data: {
      id: 'user-lucrece',
      name: 'Lucrece',
      email: 'lucrece@devsongue.com',
      password: 'Lucrece@25', // Mot de passe en clair comme demandé
      role: 'MANAGER',
      status: 'ACTIVE',
      avatarUrl: 'https://i.pravatar.cc/150?u=lucrece',
      lastLogin: new Date(),
    },
  });

  // Create businesses
  const devSongue = await prisma.business.create({
    data: {
      id: 'biz-devsongue',
      name: 'DEV SONGUE',
      type: 'SHOP',
      country: 'Côte d\'Ivoire',
      city: 'Abidjan',
      currency: 'XOF',
      logoUrl: 'https://example.com/logo-devsongue.png',
    },
  });

  const devSongueGaz = await prisma.business.create({
    data: {
      id: 'biz-devsonguegaz',
      name: 'DEV SONGUE GAZ',
      type: 'SHOP',
      country: 'Côte d\'Ivoire',
      city: 'Abidjan',
      currency: 'XOF',
      logoUrl: 'https://example.com/logo-devsonguegaz.png',
    },
  });

  // Associate managers with businesses
  // Said manages DEV SONGUE
  await prisma.user.update({
    where: { id: saidUser.id },
    data: {
      managedBusinesses: {
        connect: { id: devSongue.id },
      },
    },
  });

  // Mariam manages DEV SONGUE GAZ
  await prisma.user.update({
    where: { id: mariamUser.id },
    data: {
      managedBusinesses: {
        connect: { id: devSongueGaz.id },
      },
    },
  });

  // Lucrece manages DEV SONGUE
  await prisma.user.update({
    where: { id: lucreceUser.id },
    data: {
      managedBusinesses: {
        connect: { id: devSongue.id },
      },
    },
  });

  // Create products for DEV SONGUE
  const rice = await prisma.product.create({
    data: {
      id: 'prod-rice',
      name: 'Riz 5kg',
      category: 'Alimentation',
      stock: 100,
      minStock: 20,
      costPrice: 2000,
      retailPrice: 2500,
      wholesalePrice: 2300,
      purchasePrice: 2100,
      businessId: devSongue.id,
    },
  });

  const oil = await prisma.product.create({
    data: {
      id: 'prod-oil',
      name: 'Huile de palme 1L',
      category: 'Alimentation',
      stock: 50,
      minStock: 10,
      costPrice: 900,
      retailPrice: 1200,
      wholesalePrice: 1100,
      purchasePrice: 1000,
      businessId: devSongue.id,
    },
  });

  // Create products for DEV SONGUE GAZ
  const gas12kg = await prisma.product.create({
    data: {
      id: 'prod-gas12',
      name: 'Gaz 12kg',
      category: 'Énergie',
      stock: 30,
      minStock: 5,
      costPrice: 7000,
      retailPrice: 8000,
      wholesalePrice: 7500,
      purchasePrice: 7200,
      businessId: devSongueGaz.id,
    },
  });

  const gas6kg = await prisma.product.create({
    data: {
      id: 'prod-gas6',
      name: 'Gaz 6kg',
      category: 'Énergie',
      stock: 50,
      minStock: 10,
      costPrice: 4000,
      retailPrice: 4500,
      wholesalePrice: 4200,
      purchasePrice: 4100,
      businessId: devSongueGaz.id,
    },
  });

  // Create clients for DEV SONGUE with Ivorian names and phone numbers
  const client1 = await prisma.client.create({
    data: {
      id: 'client-ds-1',
      name: 'Koffi Jean',
      contact: '01 23 45 67',
      telephone: '07 01 23 45 67', // Format ivoirien
      email: 'koffi.jean@email.ci',
      address: 'Abidjan, Marcory',
      balance: -5000,
      company: 'Koffi Jean Entreprise',
      notes: 'Client régulier',
      loyaltyPoints: 150,
      lastPurchaseDate: new Date('2023-10-26'),
      businessId: devSongue.id,
    },
  });

  const client2 = await prisma.client.create({
    data: {
      id: 'client-ds-2',
      name: 'Awa Bamba',
      contact: '02 34 56 78',
      telephone: '05 45 67 89 01', // Format ivoirien
      email: 'awa.bamba@email.ci',
      address: 'Abidjan, Koumassi',
      balance: 2000,
      company: 'Awa Bamba SARL',
      notes: 'Client premium',
      loyaltyPoints: 320,
      lastPurchaseDate: new Date('2023-10-25'),
      businessId: devSongue.id,
    },
  });

  // Create clients for DEV SONGUE GAZ
  const clientGaz1 = await prisma.client.create({
    data: {
      id: 'client-dsg-1',
      name: 'Yao Kouassi',
      contact: '03 45 67 89',
      telephone: '01 50 60 70 80', // Format ivoirien
      email: 'yao.kouassi@email.ci',
      address: 'Abidjan, Anyama',
      balance: -12000,
      company: 'Yao Kouassi GAZ',
      notes: 'Client professionnel',
      loyaltyPoints: 80,
      lastPurchaseDate: new Date('2023-10-22'),
      businessId: devSongueGaz.id,
    },
  });

  // Create suppliers for DEV SONGUE
  const supplier1 = await prisma.supplier.create({
    data: {
      id: 'sup-ds-1',
      name: 'Grossiste Marcory',
      product: 'Produits alimentaires',
      contacts: '01 20 30 40', // Format ivoirien
      email: 'contact@grossistemarcory.ci',
      telephone: '01 20 30 40',
      address: 'Abidjan, Marcory',
      description: 'Fournisseur de produits alimentaires locaux',
      productTypes: 'Riz, huile, épicerie',
      rating: 4,
      notes: 'Livraison rapide',
      businessId: devSongue.id,
    },
  });

  // Create suppliers for DEV SONGUE GAZ
  const supplierGaz1 = await prisma.supplier.create({
    data: {
      id: 'sup-dsg-1',
      name: 'Fournisseur de Gaz Abidjan',
      product: 'Gaz domestique',
      contacts: '02 21 31 41', // Format ivoirien
      email: 'info@gazabidjan.ci',
      telephone: '02 21 31 41',
      address: 'Abidjan, Plateau',
      description: 'Distributeur de gaz pour usage domestique',
      productTypes: 'Gaz 6kg, Gaz 12kg',
      rating: 5,
      notes: 'Service après-vente excellent',
      businessId: devSongueGaz.id,
    },
  });

  // Create sales for DEV SONGUE
  await prisma.sale.create({
    data: {
      id: 'sale-ds-1',
      reference: 'REF-001',
      date: new Date('2023-10-26'),
      clientId: client1.id,
      productId: rice.id,
      productName: rice.name,
      quantity: 2,
      unitPrice: 2500,
      discount: 0,
      tax: 0,
      total: 5000,
      profit: 400,
      saleType: 'RETAIL',
      paymentStatus: 'PAID',
      paymentMethod: 'CASH',
      businessId: devSongue.id,
    },
  });

  await prisma.sale.create({
    data: {
      id: 'sale-ds-2',
      reference: 'REF-002',
      date: new Date('2023-10-25'),
      clientId: client2.id,
      productId: oil.id,
      productName: oil.name,
      quantity: 3,
      unitPrice: 1200,
      discount: 0,
      tax: 0,
      total: 3600,
      profit: 300,
      saleType: 'WHOLESALE',
      paymentStatus: 'PAID',
      paymentMethod: 'CASH',
      businessId: devSongue.id,
    },
  });

  // Create sales for DEV SONGUE GAZ
  await prisma.sale.create({
    data: {
      id: 'sale-dsg-1',
      reference: 'REF-003',
      date: new Date('2023-10-22'),
      clientId: clientGaz1.id,
      productId: gas12kg.id,
      productName: gas12kg.name,
      quantity: 1,
      unitPrice: 8000,
      discount: 0,
      tax: 0,
      total: 8000,
      profit: 500,
      saleType: 'RETAIL',
      paymentStatus: 'PAID',
      paymentMethod: 'CASH',
      businessId: devSongueGaz.id,
    },
  });

  // Create expenses for DEV SONGUE (common Ivorian business expenses)
  await prisma.expense.create({
    data: {
      id: 'exp-ds-1',
      reference: 'EXP-001',
      date: new Date('2023-10-20'),
      category: 'Salaire',
      description: 'Salaire employé',
      amount: 80000,
      paymentMethod: 'CASH',
      businessId: devSongue.id,
    },
  });

  await prisma.expense.create({
    data: {
      id: 'exp-ds-2',
      reference: 'EXP-002',
      date: new Date('2023-10-15'),
      category: 'Services publics',
      description: 'Facture CIE',
      amount: 15000,
      paymentMethod: 'CASH',
      receiptUrl: 'https://example.com/receipt1.pdf',
      businessId: devSongue.id,
    },
  });

  // Create expenses for DEV SONGUE GAZ
  await prisma.expense.create({
    data: {
      id: 'exp-dsg-1',
      reference: 'EXP-003',
      date: new Date('2023-10-05'),
      category: 'Loyer',
      description: 'Loyer dépôt',
      amount: 150000,
      paymentMethod: 'CASH',
      receiptUrl: 'https://example.com/receipt2.pdf',
      businessId: devSongueGaz.id,
    },
  });

  console.log('Database seeded successfully with specified data!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });