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
import { EmailGeneratorService } from './email-generator.service';
import { GenerateEmailDto, EmailResponseDto } from './dto/email-generator.dto';

@ApiTags('AI Services - Email Generator')
@Controller('ai-services/email-generator')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EmailGeneratorController {
  constructor(private readonly emailGeneratorService: EmailGeneratorService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate AI-powered email content',
    description:
      'Generate professional email content for various purposes including marketing, sales, newsletters, and more. Costs 4 credits per generation.',
  })
  @ApiBody({
    type: GenerateEmailDto,
    description: 'Email generation parameters',
  })
  @ApiResponse({
    status: 200,
    description: 'Email generated successfully',
    type: EmailResponseDto,
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
  async generateEmail(
    @CurrentUser('id') userId: string,
    @Body() generateEmailDto: GenerateEmailDto,
  ): Promise<EmailResponseDto> {
    return this.emailGeneratorService.generateEmail(userId, generateEmailDto);
  }
}
