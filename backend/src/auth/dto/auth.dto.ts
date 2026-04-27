import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password!: string;

  @IsString()
  fullName!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(['customer', 'driver']) // Only allow these roles via public registration
  role?: 'customer' | 'driver';
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}
