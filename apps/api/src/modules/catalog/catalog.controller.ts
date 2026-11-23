import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get(':restaurantId')
  async getCatalog(@Param('restaurantId') restaurantId: string) {
    return this.catalogService.getCatalogByRestaurantId(restaurantId);
  }

  @Put(':restaurantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RESTAURANT_OWNER, Role.ADMIN)
  async updateCatalog(
    @Param('restaurantId') restaurantId: string,
    @Body() payload: any,
  ) {
    return this.catalogService.upsertDynamicCatalog(restaurantId, payload);
  }
}
