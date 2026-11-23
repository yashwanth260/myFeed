import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { MongoClient, Db, Collection, Document } from 'mongodb';
import { envConfig } from '../../config/env.config';
import { AppLoggerService } from '../../common/logger/app-logger.service';

@Injectable()
export class MongoDBService implements OnModuleInit, OnModuleDestroy {
  private client!: MongoClient;
  private db!: Db;
  private isConnected = false;

  constructor(private readonly logger: AppLoggerService) { }

  async onModuleInit() {
    this.logger.log(
      `Initializing MongoDB connection pool for dynamic catalog (Min: ${envConfig.mongodb.minPoolSize}, Max: ${envConfig.mongodb.maxPoolSize})...`,
      'MongoDBService',
    );

    try {
      this.client = new MongoClient(envConfig.mongodb.uri, {
        minPoolSize: envConfig.mongodb.minPoolSize,
        maxPoolSize: envConfig.mongodb.maxPoolSize,
        connectTimeoutMS: envConfig.mongodb.connectTimeoutMS,
        serverSelectionTimeoutMS: 5000,
      });

      await this.client.connect();
      this.db = this.client.db(envConfig.mongodb.dbName);
      this.isConnected = true;
      this.logger.log('MongoDB connection pool established successfully.', 'MongoDBService');
      await this.ensureIndexes();
    } catch (err: any) {
      this.logger.warn(
        `MongoDB dynamic catalog connection failed or offline: ${err.message}. Running in resilient fallback mode.`,
        'MongoDBService',
      );
      this.isConnected = false;
    }
  }

  async onModuleDestroy() {
    if (this.client && this.isConnected) {
      this.logger.log('Closing MongoDB connection pool...', 'MongoDBService');
      await this.client.close();
      this.isConnected = false;
      this.logger.log('MongoDB connection pool disconnected.', 'MongoDBService');
    }
  }

  private async ensureIndexes() {
    if (!this.db) return;
    try {
      const catalogs = this.db.collection('restaurant_catalogs');
      await catalogs.createIndex({ restaurantId: 1 }, { unique: true });
      await catalogs.createIndex({ 'categories.items.id': 1 });
      await catalogs.createIndex({ 'categories.items.dietaryTags': 1 });
      await catalogs.createIndex({ updatedAt: -1 });
      this.logger.log('Dynamic catalog MongoDB indexes verified.', 'MongoDBService');
    } catch (err: any) {
      this.logger.warn(`Failed to verify MongoDB indexes: ${err.message}`, 'MongoDBService');
    }
  }

  getDb(): Db {
    return this.db;
  }

  getCollection<T extends Document = Document>(name: string): Collection<T> {
    return this.db.collection<T>(name);
  }

  async ping(): Promise<boolean> {
    if (!this.isConnected || !this.db) return false;
    try {
      await this.db.command({ ping: 1 });
      return true;
    } catch {
      return false;
    }
  }
}
