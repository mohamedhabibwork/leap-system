import { Controller, Get, Post, Body, Patch, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PayPalService } from './paypal.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paypalService: PayPalService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Process payment (mock PayPal)' })
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get('my-payments')
  @ApiOperation({ summary: 'Get current user payment history' })
  getMyPayments(@CurrentUser() user: any) {
    return this.paymentsService.findByUser(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.findOne(id);
  }

  @Get(':id/invoice')
  @ApiOperation({ summary: 'Generate/download invoice' })
  generateInvoice(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.generateInvoice(id);
  }

  @Post('create-order')
  @ApiOperation({ summary: 'Create PayPal order' })
  async createOrder(@Body() body: { amount: string; currency?: string }) {
    return this.paypalService.createOrder(body.amount, body.currency);
  }

  @Post('capture-order')
  @ApiOperation({ summary: 'Capture PayPal order' })
  async captureOrder(@Body() body: { orderId: string }, @CurrentUser() user: any) {
    const result = await this.paypalService.captureOrder(body.orderId);
    
    // Create payment record
    const payment = await this.paymentsService.create({
      userId: user.userId,
      amount: parseFloat(result.purchase_units[0].amount.value),
      currency: result.purchase_units[0].amount.currency_code,
      paymentMethod: 'paypal',
      status: 'completed',
      transactionId: result.id,
    } as any);

    return { result, payment };
  }

  @Post('create-subscription')
  @ApiOperation({ summary: 'Create PayPal subscription' })
  async createSubscription(
    @Body() body: { planId: string },
    @CurrentUser() user: any,
  ) {
    return this.paypalService.createSubscription(body.planId, user.userId.toString());
  }

  @Post('cancel-subscription/:id')
  @ApiOperation({ summary: 'Cancel PayPal subscription' })
  async cancelSubscription(@Param('id') subscriptionId: string) {
    return this.paypalService.cancelSubscription(subscriptionId);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update payment (Admin only)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.update(id, updatePaymentDto);
  }
}
