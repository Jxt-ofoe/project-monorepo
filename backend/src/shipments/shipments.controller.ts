import {
  Controller, Get, Post, Patch, Body, Param,
  UseGuards, Request, Query,
} from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { DriversService } from '../drivers/drivers.service';
import {
  CreateShipmentDto, UpdateShipmentStatusDto,
  AssignDriverDto, ShipmentFiltersDto,
} from './dto/shipments.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api')
export class ShipmentsController {
  constructor(
    private readonly shipmentsService: ShipmentsService,
    private readonly driversService: DriversService,
  ) {}

  // ── Customer endpoints ──────────────────────────────────────────────────────

  @Roles('customer', 'admin', 'dispatcher')
  @Get('customer/dashboard')
  getCustomerDashboard(@Request() req: any) {
    return this.shipmentsService.getCustomerDashboard(req.user.id);
  }

  @Roles('customer')
  @Post('shipments')
  createShipment(@Body() dto: CreateShipmentDto, @Request() req: any) {
    return this.shipmentsService.create(dto, req.user.id);
  }

  @Roles('customer', 'admin', 'dispatcher')
  @Get('shipments')
  getMyShipments(@Request() req: any, @Query() filters: ShipmentFiltersDto) {
    return this.shipmentsService.findAllForCustomer(req.user.id, filters);
  }

  @Roles('customer', 'admin', 'dispatcher', 'driver')
  @Get('shipments/:id')
  getShipment(@Param('id') id: string) {
    return this.shipmentsService.findById(id);
  }

  /** Public-style tracking — accessible to anyone with the tracking number */
  @Roles('customer', 'admin', 'dispatcher', 'driver')
  @Get('track/:trackingNumber')
  trackShipment(@Param('trackingNumber') trackingNumber: string) {
    return this.shipmentsService.findByTracking(trackingNumber);
  }

  @Roles('customer')
  @Post('shipments/:id/cancel')
  cancelShipment(@Param('id') id: string, @Request() req: any) {
    return this.shipmentsService.cancelShipment(id, req.user.id);
  }

  @Roles('customer', 'admin', 'dispatcher')
  @Post('shipments/calculate-quote')
  calculateQuote(@Body() body: any) {
    return this.shipmentsService.calculateQuote(body);
  }

  // ── Dispatcher endpoints ────────────────────────────────────────────────────

  @Roles('admin', 'dispatcher')
  @Get('dispatcher/orders')
  getAllOrders(@Query() filters: ShipmentFiltersDto) {
    return this.shipmentsService.findAllForDispatcher(filters);
  }

  @Roles('admin', 'dispatcher')
  @Patch('shipments/:id/assign')
  assignDriver(@Param('id') id: string, @Body() dto: AssignDriverDto) {
    return this.shipmentsService.assignDriver(id, dto);
  }

  @Roles('admin', 'dispatcher')
  @Patch('shipments/:id/update-status')
  adminUpdateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateShipmentStatusDto,
    @Request() req: any,
  ) {
    return this.shipmentsService.updateStatus(id, dto, req.user.id);
  }

  // ── Driver endpoints ────────────────────────────────────────────────────────

  /** Get today's assigned jobs for the logged-in driver */
  @Roles('driver')
  @Get('driver/jobs')
  async getDriverJobs(@Request() req: any) {
    const driver = await this.driversService.findByUserId(req.user.id);
    if (!driver) return [];
    return this.shipmentsService.findForDriver(driver.id);
  }

  @Roles('driver', 'admin', 'dispatcher')
  @Patch('shipments/:id/status')
  driverUpdateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateShipmentStatusDto,
    @Request() req: any,
  ) {
    return this.shipmentsService.updateStatus(id, dto, req.user.id);
  }
}
