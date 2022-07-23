import { handler } from 'pactum';
import { ShopDto } from '../../src/shop/dto';
import { v4 as uuidv4 } from 'uuid';

handler.addSpecHandler('createShop', (ctx) => {
  const { spec, data } = ctx;
  const shop: ShopDto = {
    name: `Shop Name ${uuidv4()}`,
    description: `Shop Description ${uuidv4()}`,
    website: `www.${uuidv4()}.com`,
  };

  spec
    .post('/v1/shops')
    .withHeaders({
      Authorization: `Bearer $S{accessToken-${data}}`,
    })
    .withBody(shop)
    .stores('shopId', 'id');
});

handler.addSpecHandler('deleteShop', (ctx: handler.SpecHandlerContext) => {
  const { spec, data } = ctx;
  const shopId = data.shopId;
  const user = data.user;

  spec
    .delete('/v1/shops/$S{shopId}')
    .withPathParams('id', `$S{${shopId}}`)
    .withHeaders({
      Authorization: `Bearer $S{accessToken-${user}}`,
    });
});
