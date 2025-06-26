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
import { PostGeneratorService } from './post-generator.service';
import { GeneratePostDto, PostResponseDto } from './dto/post-generator.dto';

@ApiTags('AI Services - Post Generator')
@Controller('ai-services/post-generator')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PostGeneratorController {
  constructor(private readonly postGeneratorService: PostGeneratorService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate AI-powered social media post',
    description:
      'Generate engaging social media posts tailored for specific platforms and audiences. Costs 3 credits per generation.',
  })
  @ApiBody({
    type: GeneratePostDto,
    description: 'Post generation parameters',
  })
  @ApiResponse({
    status: 200,
    description: 'Post generated successfully',
    type: PostResponseDto,
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
  async generatePost(
    @CurrentUser('id') userId: string,
    @Body() generatePostDto: GeneratePostDto,
  ): Promise<PostResponseDto> {
    return this.postGeneratorService.generatePost(userId, generatePostDto);
  }
}
