import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PromptMarketplaceService } from './prompt-marketplace.service';
import {
  BrowsePromptsDto,
  UsePromptDto,
  MarketplaceResponseDto,
  PromptUsageResponseDto,
} from './dto/prompt-marketplace.dto';

@ApiTags('AI Services - Prompt Marketplace')
@Controller('ai-services/prompt-marketplace')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PromptMarketplaceController {
  constructor(
    private readonly promptMarketplaceService: PromptMarketplaceService,
  ) {}

  @Get('browse')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Browse available prompt templates',
    description: 'Browse and search through available AI prompt templates',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by category',
  })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of results',
  })
  @ApiResponse({
    status: 200,
    description: 'Prompt templates retrieved successfully',
    type: MarketplaceResponseDto,
  })
  async browsePrompts(
    @Query() browseDto: BrowsePromptsDto,
  ): Promise<MarketplaceResponseDto> {
    return this.promptMarketplaceService.browsePrompts(browseDto);
  }

  @Post('use')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Use a prompt template',
    description:
      'Use a prompt template to generate content. Costs 1 credit per use.',
  })
  @ApiBody({
    type: UsePromptDto,
    description: 'Prompt usage parameters',
  })
  @ApiResponse({
    status: 200,
    description: 'Content generated successfully using prompt',
    type: PromptUsageResponseDto,
  })
  @ApiResponse({
    status: 403,
    description:
      'Insufficient credits or service not available in current plan',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Bearer token required',
  })
  async usePrompt(
    @CurrentUser('id') userId: string,
    @Body() usePromptDto: UsePromptDto,
  ): Promise<PromptUsageResponseDto> {
    return this.promptMarketplaceService.usePrompt(userId, usePromptDto);
  }
}
