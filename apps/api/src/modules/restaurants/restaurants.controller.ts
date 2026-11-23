import { Controller, Get, Patch, Param, Query, Body } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { SearchRestaurantsDto } from './dto/search-restaurants.dto';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get()
  async getRestaurants(@Query() query: SearchRestaurantsDto) {
    return this.restaurantsService.findAll(query);
  }

  @Get(':idOrSlug/menu')
  async getRestaurantMenu(@Param('idOrSlug') idOrSlug: string) {
    const items = await this.restaurantsService.fetchMenu(idOrSlug);
    return { items };
  }

  @Patch(':idOrSlug/menu/:itemId')
  async toggleStock(
    @Param('idOrSlug') idOrSlug: string,
    @Param('itemId') itemId: string,
    @Body('isAvailable') isAvailable: boolean,
  ) {
    return this.restaurantsService.toggleItemStock(idOrSlug, itemId, isAvailable);
  }

  @Get(':idOrSlug')
  async getRestaurant(@Param('idOrSlug') idOrSlug: string) {
    return this.restaurantsService.findBySlugOrId(idOrSlug);
  }
}
