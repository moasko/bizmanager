import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create users with Ivorian names
  const adminUser = await prisma.user.create({
    data: {
      id: 'user-1',
      name: 'Koffi Adjoa',
      email: 'koffi.adjoa@devsonguesuite.ci',
      password: 'password123',
      role: 'Admin',
      avatarUrl: 'https://i.pravatar.cc/150?u=admin',
    },
  });

  const managerUser = await prisma.user.create({
    data: {
      id: 'user-2',
      name: 'Awa Diallo',
      email: 'awa.diallo@devsonguesuite.ci',
      password: 'password123',
      role: 'Gérant',
      avatarUrl: 'https://i.pravatar.cc/150?u=gerant',
    },
  });

  // Create businesses with Ivorian names
  const boutique = await prisma.business.create({
    data: {
      id: 'biz-1',
      name: 'Boutique Adjamé',
      type: 'Commerce de détail',
    },
  });

  const services = await prisma.business.create({
    data: {
      id: 'biz-2',
      name: 'Services Numériques CI',
      type: 'Fourniture de services',
    },
  });

  // Associate manager with boutique
  await prisma.user.update({
    where: { id: managerUser.id },
    data: {
      managedBusinesses: {
        connect: { id: boutique.id },
      },
    },
  });

  // Create products for boutique (common Ivorian products)
  const attieke = await prisma.product.create({
    data: {
      id: 'prod-1',
      name: 'Attiéké 1kg',
      category: 'Alimentation',
      stock: 50,
      retailPrice: 500,
      wholesalePrice: 450,
      business: {
        connect: { id: boutique.id },
      },
    },
  });

  const palmOil = await prisma.product.create({
    data: {
      id: 'prod-2',
      name: 'Huile de palme 50cl',
      category: 'Alimentation',
      stock: 30,
      retailPrice: 1200,
      wholesalePrice: 1100,
      business: {
        connect: { id: boutique.id },
      },
    },
  });

  const soap = await prisma.product.create({
    data: {
      id: 'prod-3',
      name: 'Savon de Marseille',
      category: 'Hygiène',
      stock: 100,
      retailPrice: 600,
      wholesalePrice: 550,
      business: {
        connect: { id: boutique.id },
      },
    },
  });

  const coffee = await prisma.product.create({
    data: {
      id: 'prod-4',
      name: 'Café Ivoirien 500g',
      category: 'Alimentation',
      stock: 25,
      retailPrice: 2500,
      wholesalePrice: 2300,
      business: {
        connect: { id: boutique.id },
      },
    },
  });

  // Create products for services
  const maintenance = await prisma.product.create({
    data: {
      id: 'prod-b2-1',
      name: 'Maintenance Informatique',
      category: 'Service',
      stock: 999,
      retailPrice: 150000,
      wholesalePrice: 150000,
      business: {
        connect: { id: services.id },
      },
    },
  });

  // Create clients for boutique with Ivorian names and phone numbers
  const amara = await prisma.client.create({
    data: {
      id: 'client-1',
      name: 'Amara Koné',
      contact: '01 23 45 67',
      telephone: '07 01 23 45 67', // Format ivoirien
      email: 'amara.kone@email.ci',
      address: 'Abidjan, Cocody',
      balance: -12000,
      business: {
        connect: { id: boutique.id },
      },
    },
  });

  const yao = await prisma.client.create({
    data: {
      id: 'client-2',
      name: 'Yao Assi',
      contact: '02 34 56 78',
      telephone: '05 45 67 89 01', // Format ivoirien
      email: 'yao.assi@email.ci',
      address: 'Abidjan, Treichville',
      balance: 2500,
      business: {
        connect: { id: boutique.id },
      },
    },
  });

  // Create clients for services
  const entrepriseA = await prisma.client.create({
    data: {
      id: 'client-b2-1',
      name: 'Société Ivoirienne de Services',
      contact: '03 45 67 89',
      telephone: '01 50 60 70 80', // Format ivoirien
      email: 'contact@siv.ci',
      address: 'Abidjan, Plateau',
      balance: -150000,
      business: {
        connect: { id: services.id },
      },
    },
  });

  // Create suppliers with Ivorian names and details
  const grossiste = await prisma.supplier.create({
    data: {
      id: 'sup-1',
      name: 'Grossiste Abidjan',
      product: 'Produits alimentaires',
      contacts: '01 20 30 40', // Format ivoirien
      description: 'Fournisseur de produits alimentaires locaux',
      productTypes: 'Produits de base, épicerie',
      business: {
        connect: { id: boutique.id },
      },
    },
  });

  const savonnerie = await prisma.supplier.create({
    data: {
      id: 'sup-2',
      name: 'Savonnerie d\'Abidjan',
      product: 'Savons et détergents',
      contacts: '02 21 31 41', // Format ivoirien
      description: 'Fabricant local de savons artisanaux',
      productTypes: 'Savons, détergents, produits d\'entretien',
      business: {
        connect: { id: boutique.id },
      },
    },
  });

  // Create suppliers for services
  const fournitures = await prisma.supplier.create({
    data: {
      id: 'sup-b2-1',
      name: 'Fournitures Bureau CI',
      product: 'Fournitures de bureau',
      contacts: '03 22 32 42', // Format ivoirien
      description: 'Spécialiste en fournitures de bureau et informatiques',
      productTypes: 'Fournitures de bureau, équipements informatiques',
      business: {
        connect: { id: services.id },
      },
    },
  });

  // Create sales for boutique
  await prisma.sale.create({
    data: {
      id: 'sale-1',
      date: new Date('2023-10-26'),
      clientId: amara.id,
      clientName: amara.name,
      productId: attieke.id,
      productName: attieke.name,
      quantity: 5,
      unitPrice: 500,
      total: 2500,
      saleType: 'Vente en gros',
      business: {
        connect: { id: boutique.id },
      },
    },
  });

  await prisma.sale.create({
    data: {
      id: 'sale-2',
      date: new Date('2023-10-25'),
      clientId: yao.id,
      clientName: yao.name,
      productId: palmOil.id,
      productName: palmOil.name,
      quantity: 3,
      unitPrice: 1200,
      total: 3600,
      saleType: 'Vente au détail',
      business: {
        connect: { id: boutique.id },
      },
    },
  });

  await prisma.sale.create({
    data: {
      id: 'sale-3',
      date: new Date('2023-09-15'),
      clientId: amara.id,
      clientName: amara.name,
      productId: soap.id,
      productName: soap.name,
      quantity: 2,
      unitPrice: 600,
      total: 1200,
      saleType: 'Vente au détail',
      business: {
        connect: { id: boutique.id },
      },
    },
  });

  // Create sales for services
  await prisma.sale.create({
    data: {
      id: 'sale-b2-1',
      date: new Date('2023-10-22'),
      clientId: entrepriseA.id,
      clientName: entrepriseA.name,
      productId: maintenance.id,
      productName: maintenance.name,
      quantity: 1,
      unitPrice: 150000,
      total: 150000,
      saleType: 'Vente au détail',
      business: {
        connect: { id: services.id },
      },
    },
  });

  // Create expenses for boutique (common Ivorian business expenses)
  await prisma.expense.create({
    data: {
      id: 'exp-1',
      date: new Date('2023-10-20'),
      category: 'Salaire',
      description: 'Salaire employé',
      amount: 75000,
      business: {
        connect: { id: boutique.id },
      },
    },
  });

  await prisma.expense.create({
    data: {
      id: 'exp-2',
      date: new Date('2023-10-15'),
      category: 'Services publics',
      description: 'Facture CIE',
      amount: 15000,
      business: {
        connect: { id: boutique.id },
      },
    },
  });

  await prisma.expense.create({
    data: {
      id: 'exp-3',
      date: new Date('2023-09-10'),
      category: 'Télécommunications',
      description: 'Achat de crédit mobile',
      amount: 10000,
      business: {
        connect: { id: boutique.id },
      },
    },
  });

  // Create expenses for services
  await prisma.expense.create({
    data: {
      id: 'exp-b2-1',
      date: new Date('2023-10-05'),
      category: 'Loyer',
      description: 'Loyer bureau Abidjan',
      amount: 200000,
      business: {
        connect: { id: services.id },
      },
    },
  });

  console.log('Database seeded successfully with Ivorian data!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });