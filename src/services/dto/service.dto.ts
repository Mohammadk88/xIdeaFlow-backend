import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({
    description: 'Service unique name',
    example: 'content_generation',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Service display title',
    example: 'Content Generation',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Service description',
    example: 'Generate engaging content for social media posts',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Service icon URL or identifier',
    example: 'content-icon.svg',
    required: false,
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({
    description: 'Whether the service is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Credit cost per usage',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  creditCost?: number;
}

export class ServiceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  icon?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  creditCost: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
