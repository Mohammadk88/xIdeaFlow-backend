export interface JwtPayload {
  sub: string; // User ID
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
}

export interface RefreshTokenUser {
  id: string;
  email: string;
  refreshToken: string;
}

export interface UserWithCredits extends AuthenticatedUser {
  userCredit?: {
    totalCredits: number;
    usedCredits: number;
    availableCredits: number;
    planType: string;
  };
  activeSubscription?: {
    planName: string;
    endDate: Date | null;
    isActive: boolean;
  };
}
