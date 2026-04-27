import { IsNumber, IsString, IsEnum, IsOptional } from 'class-validator';

export class CreateServiceRateDto {
  @IsNumber()
  weightFrom!: number;

  @IsNumber()
  weightTo!: number;

  @IsString()
  zone!: string;

  @IsNumber()
  pricePerKg!: number;

  @IsNumber()
  pricePerKm!: number;

  @IsNumber()
  baseFee!: number;

  @IsOptional()
  @IsEnum(['standard', 'express', 'same_day'])
  priority?: 'standard' | 'express' | 'same_day';
}

export class QuoteDto {
  @IsNumber()
  weightKg!: number;

  @IsNumber()
  pickupLat!: number;

  @IsNumber()
  pickupLng!: number;

  @IsNumber()
  deliveryLat!: number;

  @IsNumber()
  deliveryLng!: number;

  @IsOptional()
  @IsString()
  zone?: string;

  @IsOptional()
  @IsEnum(['standard', 'express', 'same_day'])
  priority?: 'standard' | 'express' | 'same_day';
}
