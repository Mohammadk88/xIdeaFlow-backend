import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdCopyGeneratorService } from './ad-copy-generator.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/auth.interface';
import {
  GenerateAdCopyDto,
  AdCopyResponseDto,
} from './dto/ad-copy-generator.dto';

@ApiTags('AI Ad Copy Generator')
@Controller('ai-services/ad-copy-generator')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdCopyGeneratorController {
  constructor(private adCopyGeneratorService: AdCopyGeneratorService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate optimized ad copy for multiple platforms' })
  @ApiResponse({
    status: 200,
    description: 'Ad copy generated successfully',
    type: AdCopyResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Insufficient credits or invalid request',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Service not available in subscription plan',
  })
  async generateAdCopy(
    @Body() generateAdCopyDto: GenerateAdCopyDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AdCopyResponseDto> {
    return this.adCopyGeneratorService.generateAdCopy(
      user.id,
      generateAdCopyDto,
    );
  }
}
