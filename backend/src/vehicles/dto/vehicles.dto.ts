import { IsString, IsEnum, IsNumber, IsOptional } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  plateNumber!: string;

  @IsEnum(['bike', 'car', 'van', 'truck'])
  type!: 'bike' | 'car' | 'van' | 'truck';

  @IsNumber()
  capacityKg!: number;

  @IsOptional()
  @IsString()
  make?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsNumber()
  year?: number;
}

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  plateNumber?: string;

  @IsOptional()
  @IsEnum(['bike', 'car', 'van', 'truck'])
  type?: 'bike' | 'car' | 'van' | 'truck';

  @IsOptional()
  @IsNumber()
  capacityKg?: number;

  @IsOptional()
  @IsEnum(['active', 'maintenance', 'retired'])
  status?: 'active' | 'maintenance' | 'retired';

  @IsOptional()
  @IsString()
  make?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsNumber()
  year?: number;
}
