import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';

class UpdateUserDto {
  @IsOptional() @IsString() fullName?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;

  // Typed as a union so it matches the UsersService param signature
  @IsOptional()
  @IsEnum(['admin', 'dispatcher', 'driver', 'customer'])
  role?: 'admin' | 'dispatcher' | 'driver' | 'customer';
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/admin')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles('admin')
  @Get('users')
  findAll() {
    return this.usersService.findAll();
  }

  @Roles('admin')
  @Get('users/:id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Roles('admin')
  @Patch('users/:id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }
}
