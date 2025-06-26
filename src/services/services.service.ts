import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/service.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async createService(createServiceDto: CreateServiceDto) {
    return this.prisma.service.create({
      data: createServiceDto,
    });
  }

  async findAll() {
    return this.prisma.service.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.service.findUnique({
      where: { id },
    });
  }

  async findByName(name: string) {
    return this.prisma.service.findUnique({
      where: { name },
    });
  }

  async updateService(id: string, updateData: Partial<CreateServiceDto>) {
    return this.prisma.service.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteService(id: string) {
    return this.prisma.service.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
