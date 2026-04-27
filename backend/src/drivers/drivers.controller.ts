import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { CreateDriverDto, UpdateDriverDto, UpdateDriverLocationDto } from './dto/drivers.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  // ── Admin / Dispatcher ──────────────────────────────────────────────────────

  @Roles('admin', 'dispatcher')
  @Post('admin/drivers')
  create(@Body() createDriverDto: CreateDriverDto) {
    return this.driversService.create(createDriverDto);
  }

  @Roles('admin', 'dispatcher')
  @Get('admin/drivers')
  findAll() {
    return this.driversService.findAll();
  }

  @Roles('admin', 'dispatcher')
  @Get('admin/drivers/:id')
  findOne(@Param('id') id: string) {
    return this.driversService.findOne(id);
  }

  @Roles('admin', 'dispatcher')
  @Patch('admin/drivers/:id')
  update(@Param('id') id: string, @Body() updateDriverDto: UpdateDriverDto) {
    return this.driversService.update(id, updateDriverDto);
  }

  /** Fleet map endpoint — returns lat/lng for all drivers */
  @Roles('admin', 'dispatcher')
  @Get('dispatcher/fleet/tracking')
  getFleetLocations() {
    return this.driversService.getFleetLocations();
  }

  // ── Driver self-update ──────────────────────────────────────────────────────

  /** Driver updates their own location (REST fallback for Socket.io) */
  @Roles('driver')
  @Patch('driver/location')
  async updateMyLocation(@Request() req: any, @Body() dto: UpdateDriverLocationDto) {
    const driver = await this.driversService.findByUserId(req.user.id);
    if (!driver) throw new Error('Driver profile not found');
    return this.driversService.updateLocation(driver.id, dto);
  }
}
