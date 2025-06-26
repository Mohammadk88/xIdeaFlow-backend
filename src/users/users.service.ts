import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from '../auth/dto/auth.dto';
import * as bcrypt from 'bcryptjs';
import { UserWithCredits } from '../common/interfaces/auth.interface';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(createUserDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
        userCredit: {
          create: {
            totalCredits: 10, // Signup bonus
            usedCredits: 0,
            planType: 'FREE',
          },
        },
      },
      include: {
        userCredit: true,
      },
    });

    // Create bonus credit event
    await this.prisma.bonusCreditEvent.create({
      data: {
        userId: user.id,
        event: 'signup',
        credits: 10,
        description: 'Welcome bonus credits',
      },
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        userCredit: true,
        subscriptions: {
          where: { isActive: true },
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  async findById(id: string): Promise<UserWithCredits | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        userCredit: true,
        subscriptions: {
          where: { isActive: true },
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      userCredit: user.userCredit
        ? {
            totalCredits: user.userCredit.totalCredits,
            usedCredits: user.userCredit.usedCredits,
            availableCredits:
              user.userCredit.totalCredits - user.userCredit.usedCredits,
            planType: user.userCredit.planType,
          }
        : undefined,
      activeSubscription: user.subscriptions[0]
        ? {
            planName: user.subscriptions[0].plan.name,
            endDate: user.subscriptions[0].endDate,
            isActive: user.subscriptions[0].isActive,
          }
        : undefined,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }
}
