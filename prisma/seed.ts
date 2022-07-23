import { PrismaClient } from '@prisma/client';

import { reviews, rooms, shops, users, usersOnRooms } from './seed-data';

const prisma = new PrismaClient();

async function main() {
  await prisma.usersOnRoom.deleteMany();
  await prisma.review.deleteMany();
  await prisma.shop.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();

  for (const user of users) {
    await prisma.user.create({ data: user });
  }

  for (const room of rooms) {
    await prisma.room.create({ data: room });
  }

  for (const shop of shops) {
    await prisma.shop.create({ data: shop });
  }

  for (const review of reviews) {
    await prisma.review.create({ data: review });
  }

  for (const userOnRoom of usersOnRooms) {
    await prisma.usersOnRoom.create({ data: userOnRoom });
  }
}

main()
  .catch((e) => {
    console.log(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
