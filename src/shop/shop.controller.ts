import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Shop } from '@prisma/client';

import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { ShopService } from './shop.service';
import { ShopDto, ShopEntity } from './dto';

@UseGuards(JwtGuard)
@ApiTags('Shops')
@ApiBearerAuth()
@Controller('shops')
export class ShopController {
  constructor(private shopService: ShopService) {}

  @Get()
  async getShops(): Promise<ShopEntity[]> {
    const shops = await this.shopService.getShops();
    return shops.map((shop: Shop) => new ShopEntity(shop));
  }

  @Get(':shopId')
  async getShopById(@Param('shopId') shopId: string): Promise<ShopEntity> {
    return new ShopEntity(await this.shopService.getShopById(shopId));
  }

  @Post()
  async createShop(
    @GetUser('id') userId: string,
    @Body() dto: ShopDto,
  ): Promise<ShopEntity> {
    return new ShopEntity(await this.shopService.createShop(userId, dto));
  }

  @Patch(':shopId')
  async editShopById(
    @GetUser('id') userId: string,
    @Param('shopId') shopId: string,
    @Body() dto: ShopDto,
  ): Promise<ShopEntity> {
    return new ShopEntity(await this.shopService.editShopById(userId, shopId, dto));
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':shopId')
  deleteShopById(@GetUser('id') userId: string, @Param('shopId') shopId: string) {
    return this.shopService.deleteShopById(userId, shopId);
  }
}
