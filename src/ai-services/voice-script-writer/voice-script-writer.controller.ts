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
import { VoiceScriptWriterService } from './voice-script-writer.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/auth.interface';
import {
  GenerateVoiceScriptDto,
  VoiceScriptResponseDto,
} from './dto/voice-script-writer.dto';

@ApiTags('AI Voice Script Writer')
@Controller('ai-services/voice-script-writer')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VoiceScriptWriterController {
  constructor(private voiceScriptWriterService: VoiceScriptWriterService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate professional voice scripts for various media' })
  @ApiResponse({
    status: 200,
    description: 'Voice script generated successfully',
    type: VoiceScriptResponseDto,
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
  async generateVoiceScript(
    @Body() generateVoiceScriptDto: GenerateVoiceScriptDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<VoiceScriptResponseDto> {
    return this.voiceScriptWriterService.generateVoiceScript(
      user.id,
      generateVoiceScriptDto,
    );
  }
}
