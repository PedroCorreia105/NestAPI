import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Shop } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { ShopDto } from './dto';

@Injectable()
export class ShopService {
  constructor(private prisma: PrismaService) {}

  getShops(): Promise<Shop[]> {
    return this.prisma.shop.findMany();
  }

  async getShopById(shopId: string): Promise<Shop> {
    const shop = await this.prisma.shop.findUnique({
      where: {
        id: shopId,
      },
    });

    if (!shop) throw new NotFoundException('Shop not Found');

    return shop;
  }

  createShop(userId: string, dto: ShopDto): Promise<Shop> {
    return this.prisma.shop.create({
      data: {
        userId: userId,
        ...dto,
      },
    });
  }

  async editShopById(userId: string, shopId: string, dto: ShopDto): Promise<Shop> {
    const shop = await this.prisma.shop.findUnique({
      where: {
        id: shopId,
      },
    });

    if (!shop) throw new NotFoundException('Shop not Found');

    // check if user manages the shop
    if (shop.userId !== userId)
      throw new ForbiddenException('Access to resources denied');

    return this.prisma.shop.update({
      where: {
        id: shopId,
      },
      data: {
        ...dto,
      },
    });
  }

  async deleteShopById(userId: string, shopId: string) {
    const shop = await this.prisma.shop.findUnique({
      where: {
        id: shopId,
      },
    });

    if (!shop) throw new NotFoundException('Shop not Found');

    // check if user manages the shop
    if (shop.userId !== userId)
      throw new ForbiddenException('Access to resources denied');

    await this.prisma.shop.delete({
      where: {
        id: shopId,
      },
    });
  }
}
