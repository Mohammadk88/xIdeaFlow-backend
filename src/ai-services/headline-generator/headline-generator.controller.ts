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
import { HeadlineGeneratorService } from './headline-generator.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/auth.interface';
import {
  GenerateHeadlineDto,
  HeadlineResponseDto,
} from './dto/headline-generator.dto';

@ApiTags('AI Headline Generator')
@Controller('ai-services/headline-generator')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class HeadlineGeneratorController {
  constructor(private headlineGeneratorService: HeadlineGeneratorService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate compelling headlines for various content types',
  })
  @ApiResponse({
    status: 200,
    description: 'Headlines generated successfully',
    type: HeadlineResponseDto,
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
  async generateHeadlines(
    @Body() generateHeadlineDto: GenerateHeadlineDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<HeadlineResponseDto> {
    return this.headlineGeneratorService.generateHeadlines(
      user.id,
      generateHeadlineDto,
    );
  }
}
