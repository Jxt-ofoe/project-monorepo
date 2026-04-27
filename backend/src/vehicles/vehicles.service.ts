import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { DATABASE_TOKEN } from '../database/database.module';
import { DrizzleDB } from '../database/client';
import { vehicles, Vehicle } from '../database/schema';
import { CreateVehicleDto, UpdateVehicleDto } from './dto/vehicles.dto';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class VehiclesService {
  constructor(@Inject(DATABASE_TOKEN) private db: DrizzleDB) {}

  async findAll(): Promise<Vehicle[]> {
    return this.db.select().from(vehicles);
  }

  async findOne(id: string): Promise<Vehicle> {
    const result = await this.db.select().from(vehicles).where(eq(vehicles.id, id)).limit(1);
    if (!result[0]) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }
    return result[0];
  }

  async create(createDto: CreateVehicleDto): Promise<Vehicle> {
    const existing = await this.db.select().from(vehicles).where(eq(vehicles.plateNumber, createDto.plateNumber)).limit(1);
    if (existing[0]) {
      throw new ConflictException(`Vehicle with plate number ${createDto.plateNumber} already exists`);
    }

    const result = await this.db.insert(vehicles).values({
      id: uuidv4(),
      ...createDto,
    }).returning();

    return result[0];
  }

  async update(id: string, updateDto: UpdateVehicleDto): Promise<Vehicle> {
    await this.findOne(id); // Ensure exists

    if (updateDto.plateNumber) {
      const existing = await this.db.select().from(vehicles).where(eq(vehicles.plateNumber, updateDto.plateNumber)).limit(1);
      if (existing[0] && existing[0].id !== id) {
        throw new ConflictException(`Vehicle with plate number ${updateDto.plateNumber} already exists`);
      }
    }

    const result = await this.db.update(vehicles).set({
      ...updateDto,
      updatedAt: new Date().toISOString(),
    }).where(eq(vehicles.id, id)).returning();

    return result[0];
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.db.delete(vehicles).where(eq(vehicles.id, id));
  }
}
