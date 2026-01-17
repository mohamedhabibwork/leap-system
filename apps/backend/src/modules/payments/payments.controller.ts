import { Controller, Get, Post, Body, Patch, Param, UseGuards, ParseIntPipe, Res, Logger, Inject, Query } from '@nestjs/common';
import { Response } from 'express';
import { PaymentsService } from './payments.service';
import { PayPalService } from './paypal.service';
import { PdfService } from './pdf.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateBillingPlanDto } from './dto/create-billing-plan.dto';
import { UpdateBillingPlanDto } from './dto/update-billing-plan.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { createReadStream } from 'fs';
import { existsSync } from 'fs';
import { PlansService } from '../plans/plans.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { LookupsService } from '../lookups/lookups.service';
import { eq, and } from 'drizzle-orm';
import { lookups, lookupTypes } from '@leap-lms/database';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

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
    private readonly plansService: PlansService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly lookupsService: LookupsService,
    @Inject('DRIZZLE_DB')
    private readonly db: NodePgDatabase<any>,
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
  @ApiOperation({ 
    summary: 'Generate PayPal client token for SDK',
    description: 'Generates a browser-safe client token for PayPal SDK initialization. Also returns client ID (public, safe to expose).'
  })
  @ApiResponse({ status: 200, description: 'Client token generated successfully' })
  @ApiResponse({ status: 503, description: 'PayPal service unavailable' })
  async getClientToken() {
    try {
      const clientToken = await this.paypalService.generateClientToken();
      
      if (!clientToken || typeof clientToken !== 'string') {
        throw new Error('Invalid client token received from PayPal');
      }
      
      // Get client ID from config (safe to expose - it's public)
      // According to PayPal docs: client-id is required for standard SDK v2
      const { clientId } = this.paypalService.getPayPalConfig();
      
      return { 
        clientToken,
        clientId, // Include client ID for frontend (required for SDK v2)
      };
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
  @ApiOperation({ 
    summary: 'Create order (mock payment)',
    description: 'Creates a mock order for payment processing. Supports vault for recurring payments/subscriptions.'
  })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async createOrder(@Body() body: CreateOrderDto & { storeInVault?: boolean; vaultId?: string }, @CurrentUser() user: any) {
    // Mock order creation - simulate PayPal order structure
    const orderId = `MOCK_ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate amount from cart or use provided amount
    let totalAmount = '0.00';
    if (body.cart && body.cart.length > 0) {
      // In a real implementation, you would calculate from cart items
      // For mock, we'll use the provided amount or default
      totalAmount = body.amount || '0.00';
    } else if (body.amount) {
      totalAmount = body.amount;
    } else {
      throw new Error('Either amount or cart items must be provided');
    }

    const mockOrder = {
      id: orderId,
      status: 'CREATED',
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: body.currency || 'USD',
          value: totalAmount,
        },
        description: body.description || 'Mock payment order',
      }],
      links: [
        {
          href: `/payments/capture-order`,
          rel: 'approve',
          method: 'POST',
        },
      ],
    };

    return mockOrder;
  }

  @Post('capture-order')
  @ApiOperation({ 
    summary: 'Capture order (mock payment)',
    description: 'Captures a mock order and creates payment record. Returns vault_id if vault was enabled.'
  })
  async captureOrder(@Body() body: { orderId: string; amount?: string; currency?: string }, @CurrentUser() user: any) {
    // Mock order capture - simulate payment capture
    const captureId = `MOCK_CAPTURE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Use provided amount/currency or defaults for mock
    // In a real scenario, you'd fetch the order from storage/database
    const mockAmount = body.amount || '99.99';
    const mockCurrency = body.currency || 'USD';
    
    // Generate vault ID if needed (for subscriptions)
    const vaultId = `MOCK_VAULT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const mockCapture = {
      id: captureId,
      status: 'COMPLETED',
      purchase_units: [{
        amount: {
          currency_code: mockCurrency,
          value: mockAmount,
        },
      }],
      payment_source: {
        paypal: {
          vault: {
            id: vaultId,
          },
        },
      },
    };

    // Create payment record
    const payment = await this.paymentsService.create({
      userId: user.userId,
      amount: parseFloat(mockAmount),
      currency: mockCurrency,
      payment_method: 'paypal',
      payment_type: 'other',
      subscription_id: 0, // Mock - no subscription
    } as any);

    return { 
      id: captureId,
      status: 'COMPLETED',
      purchase_units: mockCapture.purchase_units,
      payment_source: mockCapture.payment_source,
      result: mockCapture,
      payment, 
      vault_id: vaultId, // Return vault_id for subscription creation
    };
  }

  @Post('create-subscription')
  @ApiOperation({ 
    summary: 'Create PayPal subscription with vault',
    description: 'Creates a subscription in the database with vault_id for recurring payments. Follows PayPal "Billing Agreement with Purchase" guide: https://developer.paypal.com/upgrade/ec/guide/Billing%20Agreement%20With%20Purchase/'
  })
  @ApiResponse({ status: 201, description: 'Subscription created successfully' })
  async createSubscription(
    @Body() body: { planId: string; amount?: string; currency?: string; vaultId?: string; orderId?: string },
    @CurrentUser() user: any,
  ) {
    try {
      const planId = parseInt(body.planId, 10);
      if (isNaN(planId)) {
        throw new Error('Invalid plan ID');
      }

      // Get plan details
      const plan = await this.plansService.findOne(planId);
      if (!plan) {
        throw new Error(`Plan with ID ${planId} not found`);
      }

      // Get lookup IDs for subscription status and billing cycle
      // Use LookupsService to find by type and code
      const statusLookups = await this.lookupsService.findByType('subscription_status');
      const billingLookups = await this.lookupsService.findByType('billing_cycle');

      const activeStatus = statusLookups.find((l: any) => l.code === 'active');
      const monthlyBilling = billingLookups.find((l: any) => l.code === 'monthly');

      if (!activeStatus || !monthlyBilling) {
        throw new Error('Lookup values not found. Please run database seeders.');
      }

      // Calculate subscription dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // Monthly subscription

      // Get amount from plan or provided amount
      const amount = body.amount || plan.priceMonthly?.toString() || '0.00';

      // Create subscription in database with vault_id
      // According to "Billing Agreement with Purchase" guide:
      // Store vault_id (payment method token) for future recurring payments
      const subscription = await this.subscriptionsService.create({
        userId: user.userId,
        planId: planId, // Note: schema uses planId, not plan_id
        statusId: activeStatus.id,
        billingCycleId: monthlyBilling.id, // Note: schema uses billingCycleId
        amountPaid: amount,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        autoRenew: true,
        vaultId: body.vaultId, // Store PayPal vault_id for recurring payments
      } as any);

      this.logger.log(`Subscription created for user ${user.userId}, plan ${planId}, vault_id: ${body.vaultId || 'none'}`);

      return {
        subscription,
        plan,
        vault_id: body.vaultId,
        message: 'Subscription created successfully',
      };
    } catch (error: any) {
      this.logger.error('Failed to create subscription:', error);
      throw error;
    }
  }

  @Post('setup-token')
  @ApiOperation({ 
    summary: 'Create setup token for vaulting payment method',
    description: 'Creates a temporary setup token (3-day expiry) for vaulting payment methods. Part of PayPal Vault system.'
  })
  @ApiResponse({ status: 201, description: 'Setup token created successfully' })
  async createSetupToken() {
    return this.paypalService.createSetupToken();
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

  // ==================== PayPal Billing Plans Management ====================
  // Note: These endpoints use the deprecated /v1/payments/billing-plans API
  // For new integrations, consider using /v1/billing/plans instead

  @Post('billing-plans')
  @Roles('admin')
  @ApiOperation({
    summary: 'Create PayPal billing plan',
    description: 'Creates a billing plan in PayPal. Plans are created in CREATED state and must be activated before use. Note: This API is deprecated - use /v1/billing/plans for new integrations.',
  })
  @ApiResponse({ status: 201, description: 'Billing plan created successfully' })
  async createBillingPlan(@Body() createBillingPlanDto: CreateBillingPlanDto) {
    try {
      const plan = await this.paypalService.createBillingPlan(createBillingPlanDto);
      this.logger.log(`Billing plan created: ${plan.id}`);
      return plan;
    } catch (error: any) {
      this.logger.error('Failed to create billing plan:', error);
      throw error;
    }
  }

  @Get('billing-plans')
  @Roles('admin')
  @ApiOperation({
    summary: 'List PayPal billing plans',
    description: 'Lists billing plans with optional filtering and pagination. Note: This API is deprecated.',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (0-indexed)', example: '0' })
  @ApiQuery({ name: 'page_size', required: false, description: 'Items per page', example: '10' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['CREATED', 'ACTIVE', 'INACTIVE', 'ALL'],
    description: 'Filter by plan status',
    example: 'ACTIVE',
  })
  @ApiQuery({ name: 'total_required', required: false, enum: ['yes', 'no'], description: 'Include total count', example: 'no' })
  @ApiResponse({ status: 200, description: 'List of billing plans' })
  async listBillingPlans(
    @Query('page') page?: string,
    @Query('page_size') page_size?: string,
    @Query('status') status?: 'CREATED' | 'ACTIVE' | 'INACTIVE' | 'ALL',
    @Query('total_required') total_required?: 'yes' | 'no',
  ) {
    try {
      return await this.paypalService.listBillingPlans({
        page,
        page_size,
        status,
        total_required,
      });
    } catch (error: any) {
      this.logger.error('Failed to list billing plans:', error);
      throw error;
    }
  }

  @Get('billing-plans/:planId')
  @Roles('admin')
  @ApiOperation({
    summary: 'Get PayPal billing plan details',
    description: 'Retrieves detailed information about a specific billing plan. Note: This API is deprecated.',
  })
  @ApiResponse({ status: 200, description: 'Billing plan details' })
  @ApiResponse({ status: 404, description: 'Billing plan not found' })
  async getBillingPlan(@Param('planId') planId: string) {
    try {
      return await this.paypalService.getBillingPlan(planId);
    } catch (error: any) {
      this.logger.error('Failed to get billing plan:', error);
      throw error;
    }
  }

  @Patch('billing-plans/:planId')
  @Roles('admin')
  @ApiOperation({
    summary: 'Update PayPal billing plan',
    description: 'Updates a billing plan using JSON Patch operations. Commonly used to activate/deactivate plans. Note: This API is deprecated.',
  })
  @ApiResponse({ status: 200, description: 'Billing plan updated successfully' })
  async updateBillingPlan(
    @Param('planId') planId: string,
    @Body() updateBillingPlanDto: UpdateBillingPlanDto,
  ) {
    try {
      return await this.paypalService.updateBillingPlan(planId, updateBillingPlanDto.operations);
    } catch (error: any) {
      this.logger.error('Failed to update billing plan:', error);
      throw error;
    }
  }

  @Post('billing-plans/:planId/activate')
  @Roles('admin')
  @ApiOperation({
    summary: 'Activate PayPal billing plan',
    description: 'Convenience endpoint to activate a billing plan by setting its state to ACTIVE. Note: This API is deprecated.',
  })
  @ApiResponse({ status: 200, description: 'Billing plan activated successfully' })
  async activateBillingPlan(@Param('planId') planId: string) {
    try {
      return await this.paypalService.activateBillingPlan(planId);
    } catch (error: any) {
      this.logger.error('Failed to activate billing plan:', error);
      throw error;
    }
  }

  @Post('billing-plans/:planId/deactivate')
  @Roles('admin')
  @ApiOperation({
    summary: 'Deactivate PayPal billing plan',
    description: 'Convenience endpoint to deactivate a billing plan by setting its state to INACTIVE. Note: This API is deprecated.',
  })
  @ApiResponse({ status: 200, description: 'Billing plan deactivated successfully' })
  async deactivateBillingPlan(@Param('planId') planId: string) {
    try {
      return await this.paypalService.deactivateBillingPlan(planId);
    } catch (error: any) {
      this.logger.error('Failed to deactivate billing plan:', error);
      throw error;
    }
  }
}
