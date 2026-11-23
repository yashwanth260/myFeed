import { Injectable, NotFoundException } from '@nestjs/common';
import { MongoDBService } from '../mongodb/mongodb.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisPubSubService } from '../redis-pubsub/redis-pubsub.service';
import { RestaurantCatalogDocument } from '../mongodb/schemas/dynamic-catalog.schema';

@Injectable()
export class CatalogService {
  constructor(
    private readonly mongo: MongoDBService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisPubSubService,
  ) {}

  async getCatalogByRestaurantId(restaurantId: string): Promise<RestaurantCatalogDocument | null> {
    const cacheKey = `catalog:restaurant:${restaurantId}`;

    // 1. Check Redis distributed cache first (<1ms)
    const cached = await this.redis.getSession<RestaurantCatalogDocument>(cacheKey);
    if (cached) {
      return cached;
    }

    // 2. Query MongoDB dynamic catalog collection
    const collection = this.mongo.getCollection<RestaurantCatalogDocument>('restaurant_catalogs');
    let doc: RestaurantCatalogDocument | null = null;

    try {
      doc = await collection.findOne({ restaurantId });
    } catch {
      doc = null;
    }

    // 3. Fallback: If not yet migrated to MongoDB, assemble from PostgreSQL relational schema
    if (!doc) {
      const restaurant = await this.prisma.restaurant.findUnique({
        where: { id: restaurantId },
        include: {
          categories: {
            include: {
              menuItems: {
                include: {
                  customizationGroups: {
                    include: { options: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!restaurant) {
        throw new NotFoundException(`Restaurant with ID ${restaurantId} not found`);
      }

      doc = {
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        schemaVersion: 1,
        categories: restaurant.categories.map((c) => ({
          id: c.id,
          name: c.name,
          description: '',
          displayOrder: c.displayOrder,
          items: c.menuItems.map((m) => ({
            id: m.id,
            name: m.name,
            description: m.description,
            basePricePaise: m.pricePaise,
            dietaryTags: [m.dietaryType],
            allergens: [],
            isAvailable: m.isAvailable,
            isBestseller: m.isRecommended,
            customizationMatrix: m.customizationGroups.map((g) => ({
              groupId: g.id,
              groupName: g.name,
              minSelect: g.minSelect,
              maxSelect: g.maxSelect,
              isRequired: g.isRequired,
              options: g.options.map((o) => ({
                optionId: o.id,
                name: o.name,
                priceModifierPaise: o.pricePaise,
                isDefault: false,
                isAvailable: o.isAvailable,
              })),
            })),
            updatedAt: m.updatedAt,
          })),
        })),
        promotions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    // 4. Cache in Redis with 10-minute TTL
    await this.redis.setSession(cacheKey, doc as any, 600);

    return doc;
  }

  async upsertDynamicCatalog(
    restaurantId: string,
    payload: Partial<RestaurantCatalogDocument>,
  ): Promise<RestaurantCatalogDocument> {
    const collection = this.mongo.getCollection<RestaurantCatalogDocument>('restaurant_catalogs');

    const updated = await collection.findOneAndUpdate(
      { restaurantId },
      {
        $set: {
          ...payload,
          restaurantId,
          updatedAt: new Date(),
        },
        $inc: { schemaVersion: 1 },
      },
      { upsert: true, returnDocument: 'after' },
    );

    // Invalidate Redis cache
    await this.redis.deleteSession(`catalog:restaurant:${restaurantId}`);

    return updated as any;
  }
}
