import {
  IsString, IsNumber, IsEnum, IsOptional, IsUUID,
  IsPhoneNumber, IsLatitude, IsLongitude,
} from 'class-validator';

export class CreateShipmentDto {
  // Sender
  @IsString()
  senderName!: string;

  @IsString()
  senderPhone!: string;

  @IsString()
  senderAddress!: string;

  @IsNumber()
  pickupLat!: number;

  @IsNumber()
  pickupLng!: number;

  // Receiver
  @IsString()
  receiverName!: string;

  @IsString()
  receiverPhone!: string;

  @IsString()
  receiverAddress!: string;

  @IsNumber()
  deliveryLat!: number;

  @IsNumber()
  deliveryLng!: number;

  // Package
  @IsOptional()
  @IsEnum(['document', 'parcel', 'fragile', 'perishable', 'electronics', 'other'])
  packageType?: string;

  @IsNumber()
  weightKg!: number;

  @IsOptional()
  @IsNumber()
  dimensionsL?: number;

  @IsOptional()
  @IsNumber()
  dimensionsW?: number;

  @IsOptional()
  @IsNumber()
  dimensionsH?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @IsOptional()
  @IsEnum(['standard', 'express', 'same_day'])
  priority?: string;

  @IsOptional()
  @IsString()
  scheduledPickupTime?: string;
}

export class UpdateShipmentStatusDto {
  @IsEnum(['created', 'assigned', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled'])
  status!: string;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class AssignDriverDto {
  @IsOptional()
  @IsUUID()
  driverId?: string; // If omitted, auto-selects nearest available driver
}

export class ShipmentFiltersDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
