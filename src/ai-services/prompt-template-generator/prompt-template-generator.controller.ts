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
import { PromptTemplateGeneratorService } from './prompt-template-generator.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/auth.interface';
import {
  GeneratePromptTemplateDto,
  PromptTemplateResponseDto,
} from './dto/prompt-template-generator.dto';

@ApiTags('Prompt Template Generator')
@Controller('ai-services/prompt-template-generator')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PromptTemplateGeneratorController {
  constructor(
    private promptTemplateGeneratorService: PromptTemplateGeneratorService,
  ) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate custom prompt templates for AI interactions' })
  @ApiResponse({
    status: 200,
    description: 'Prompt template generated successfully',
    type: PromptTemplateResponseDto,
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
  async generatePromptTemplate(
    @Body() generatePromptTemplateDto: GeneratePromptTemplateDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PromptTemplateResponseDto> {
    return this.promptTemplateGeneratorService.generatePromptTemplate(
      user.id,
      generatePromptTemplateDto,
    );
  }
}
