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
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { HookGeneratorService } from './hook-generator.service';
import { GenerateHookDto, HookResponseDto } from './dto/hook-generator.dto';

@ApiTags('AI Services - Hook Generator')
@Controller('ai-services/hook-generator')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class HookGeneratorController {
  constructor(private readonly hookGeneratorService: HookGeneratorService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate attention-grabbing hooks',
    description:
      'Generate compelling hooks for content across various platforms. Costs 2 credits per generation.',
  })
  @ApiBody({
    type: GenerateHookDto,
    description: 'Hook generation parameters',
  })
  @ApiResponse({
    status: 200,
    description: 'Hook generated successfully',
    type: HookResponseDto,
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
  async generateHook(
    @CurrentUser('id') userId: string,
    @Body() generateHookDto: GenerateHookDto,
  ): Promise<HookResponseDto> {
    return this.hookGeneratorService.generateHook(userId, generateHookDto);
  }
}
