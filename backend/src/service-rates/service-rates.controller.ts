import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ServiceRatesService } from './service-rates.service';
import { CreateServiceRateDto, QuoteDto } from './dto/service-rates.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api')
export class ServiceRatesController {
  constructor(private readonly serviceRatesService: ServiceRatesService) {}

  /** Public quote endpoint — no auth required */
  @Post('shipments/quote')
  async getQuote(@Body() quoteDto: QuoteDto) {
    return this.serviceRatesService.calculateQuote(quoteDto);
  }

  // ── Admin only ──────────────────────────────────────────────────────────────
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post('admin/service-rates')
  create(@Body() dto: CreateServiceRateDto, @Request() req: any) {
    return this.serviceRatesService.create(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'dispatcher')
  @Get('admin/service-rates')
  findAll() {
    return this.serviceRatesService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete('admin/service-rates/:id')
  remove(@Param('id') id: string) {
    return this.serviceRatesService.remove(id);
  }
}
