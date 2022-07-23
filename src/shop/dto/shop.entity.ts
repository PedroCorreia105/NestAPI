import { Shop } from '@prisma/client';

export class ShopEntity {
  id: string;
  name: string;
  description: string | null;
  website: string | null;

  constructor(shop: Shop) {
    this.id = shop.id;
    this.name = shop.name;
    this.description = shop.description;
    this.website = shop.website;
  }
}
