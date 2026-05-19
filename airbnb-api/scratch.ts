import prisma from './src/config/prisma.js';

async function main() {
  const result = await prisma.listing.updateMany({
    where: { status: 'PENDING' },
    data: { status: 'APPROVED' },
  });
  console.log(`Updated ${result.count} listings.`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
