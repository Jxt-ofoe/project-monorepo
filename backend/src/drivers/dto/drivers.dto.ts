import { IsString, IsOptional, IsNumber, IsEnum, IsUUID } from 'class-validator';

export class CreateDriverDto {
  @IsUUID()
  userId!: string;

  @IsString()
  licenseNumber!: string;

  @IsOptional()
  @IsUUID()
  vehicleId?: string;

  @IsOptional()
  @IsNumber()
  currentLat?: number;

  @IsOptional()
  @IsNumber()
  currentLng?: number;
}

export class UpdateDriverDto {
  @IsOptional()
  @IsUUID()
  vehicleId?: string;

  @IsOptional()
  @IsEnum(['available', 'busy', 'off'])
  status?: 'available' | 'busy' | 'off';

  @IsOptional()
  @IsString()
  licenseNumber?: string;
}

export class UpdateDriverLocationDto {
  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;

  @IsOptional()
  @IsNumber()
  bearing?: number;
}
