import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Roles('customer', 'admin', 'dispatcher')
  @Get('invoices')
  findMyInvoices(@Request() req: any) {
    return this.invoicesService.findAllForCustomer(req.user.id);
  }

  @Roles('customer', 'admin', 'dispatcher')
  @Get('invoices/:id')
  findOne(@Param('id') id: string) {
    return this.invoicesService.findById(id);
  }

  @Roles('admin', 'dispatcher')
  @Get('admin/invoices')
  findAll() {
    return this.invoicesService.findAll();
  }
}
