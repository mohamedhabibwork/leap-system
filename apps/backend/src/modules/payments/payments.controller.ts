import { Controller, Get, Post, Body, Patch, Param, UseGuards, ParseIntPipe, Res, Logger } from '@nestjs/common';
import { Response } from 'express';
import { PaymentsService } from './payments.service';
import { PayPalService } from './paypal.service';
import { PdfService } from './pdf.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { createReadStream } from 'fs';
import { existsSync } from 'fs';

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paypalService: PayPalService,
    private readonly pdfService: PdfService,
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

  @Get('client-token')
  @ApiOperation({ summary: 'Generate PayPal client token for SDK v6' })
  @ApiResponse({ status: 200, description: 'Client token generated successfully' })
  @ApiResponse({ status: 503, description: 'PayPal service unavailable' })
  async getClientToken() {
    try {
      const clientToken = await this.paypalService.generateClientToken();
      
      if (!clientToken || typeof clientToken !== 'string') {
        throw new Error('Invalid client token received from PayPal');
      }
      
      return { clientToken };
    } catch (error: any) {
      // Log the error for debugging
      this.logger.error('Failed to generate PayPal client token:', error);
      
      // Return a proper error response with appropriate status code
      const errorMessage = error?.message || 'PayPal service is not available';
      const statusCode = error?.message?.includes('not configured') ? 503 : 500;
      
      throw new Error(errorMessage);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.findOne(id);
  }

  @Get(':id/invoice')
  @ApiOperation({ summary: 'Get invoice information' })
  async getInvoice(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.generateInvoice(id);
  }

  @Get(':id/invoice/download')
  @ApiOperation({ summary: 'Download invoice PDF' })
  @ApiResponse({ status: 200, description: 'Invoice PDF file' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async downloadInvoice(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    let filePath = await this.pdfService.getInvoicePDFPath(id);
    
    if (!filePath || !existsSync(filePath)) {
      // Generate if doesn't exist
      const result = await this.pdfService.generateInvoicePDF(id);
      filePath = result.filePath;
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${id}.pdf"`);
    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);
  }

  @Post('create-order')
  @ApiOperation({ summary: 'Create PayPal order' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async createOrder(@Body() body: CreateOrderDto) {
    // Support both old format (amount) and new format (cart items)
    if (body.cart && body.cart.length > 0) {
      return this.paypalService.createOrderWithCart(
        body.cart, 
        body.currency, 
        body.amount
      );
    } else if (body.amount) {
      return this.paypalService.createOrder(body.amount, body.currency);
    } else {
      throw new Error('Either amount or cart items must be provided');
    }
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
