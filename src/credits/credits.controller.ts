import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreditsService } from './credits.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/interfaces/auth.interface';
import {
  PurchaseCreditsDto,
  CreditBalanceResponseDto,
} from './dto/credits.dto';

@ApiTags('Credits')
@Controller('credits')
export class CreditsController {
  constructor(private creditsService: CreditsService) {}

  @Get('balance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user credit balance' })
  @ApiResponse({
    status: 200,
    description: 'Credit balance retrieved successfully',
    type: CreditBalanceResponseDto,
  })
  async getBalance(@CurrentUser() user: AuthenticatedUser) {
    return this.creditsService.getUserCredits(user.id);
  }

  @Post('purchase')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Paddle checkout for credit purchase' })
  @ApiResponse({
    status: 201,
    description: 'Checkout URL created successfully',
    schema: {
      type: 'object',
      properties: {
        checkout_url: { type: 'string' },
        transaction_id: { type: 'string' },
      },
    },
  })
  async purchaseCredits(
    @Body() purchaseCreditsDto: PurchaseCreditsDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ checkout_url: string; transaction_id: string }> {
    return this.creditsService.purchaseCredits(
      user.id,
      purchaseCreditsDto.credits,
      user.email,
    );
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get credit transaction and usage history' })
  @ApiResponse({
    status: 200,
    description: 'Credit history retrieved successfully',
  })
  async getHistory(@CurrentUser() user: AuthenticatedUser) {
    return this.creditsService.getCreditHistory(user.id);
  }
}
