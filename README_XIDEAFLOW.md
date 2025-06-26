# xIdeaFlow Backend

🧠 **AI-Powered Content Generation Platform Backend**

Built with NestJS, Prisma, PostgreSQL, and OpenAI integration.

## 🚀 Features

- **Authentication & User Management** with JWT
- **Credit System** with Stripe payments
- **Subscription Plans** (Free, Pro, Business)
- **AI Content Generation** (Posts, Emails, Hooks)
- **Usage Tracking & Limits** per plan
- **Comprehensive API Documentation** with Swagger

## 🛠️ Tech Stack

- **Framework:** NestJS
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT with bcrypt
- **Payments:** Stripe
- **AI:** OpenAI API
- **Documentation:** Swagger/OpenAPI
- **Validation:** class-validator & class-transformer

## 📦 Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
Update `.env` file with your actual values:
```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/xIdeaFlow?schema=public"

# JWT
JWT_SECRET=your_jwt_secret_change_this_in_production

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# OpenAI
OPENAI_API_KEY=sk-your_openai_api_key_here

# App Config
PORT=3000
NODE_ENV=development

# Bonus Credits
SIGNUP_BONUS_CREDITS=10
REFERRAL_BONUS_CREDITS=5
```

3. **Set up the database:**
```bash
# Run database migration
npm run db:migrate

# Generate Prisma client
npm run db:generate
```

4. **Start the development server:**
```bash
npm run start:dev
```

The API will be available at:
- **Backend:** http://localhost:3000
- **API Documentation:** http://localhost:3000/api

## 🗃️ Database Schema

### Core Models:
- **User:** User accounts with authentication
- **UserCredit:** Credit balances and plan types
- **Service:** AI services (content generation, email writer, etc.)
- **SubscriptionPlan:** Available subscription plans
- **UserSubscription:** Active user subscriptions
- **CreditTransaction:** Credit purchase history
- **CreditUsageLog:** Usage tracking for analytics

## 🔗 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user profile

### Services
- `GET /services` - List all AI services
- `GET /services/:id` - Get service details

### Credits
- `GET /credits/balance` - Get user credit balance
- `POST /credits/purchase` - Create Stripe payment intent
- `GET /credits/history` - Get credit transaction history
- `POST /credits/webhook` - Stripe webhook endpoint

### Subscriptions
- `GET /subscriptions/plans` - List subscription plans
- `POST /subscriptions/subscribe` - Subscribe to a plan
- `GET /subscriptions/my-subscription` - Get current subscription
- `DELETE /subscriptions/cancel` - Cancel subscription

### AI Generation
- `POST /ai/generate-post` - Generate social media content
- `POST /ai/generate-email` - Generate email content
- `POST /ai/generate-hook` - Generate compelling hooks

## 💳 Subscription Plans

### Free Plan
- 10 monthly credits
- 5 content generations/month
- 3 emails/month
- 3 hooks/month

### Pro Plan ($29.99/month)
- 100 monthly credits
- 100 content generations/month
- 50 emails/month
- 50 hooks/month
- 20 image generations/month
- Unlimited post scheduling

### Business Plan ($99.99/month)
- 500 monthly credits
- Unlimited access to all services

## 🔧 Development Commands

```bash
# Development
npm run start:dev          # Start with watch mode
npm run start:debug        # Start with debug mode

# Database
npm run db:migrate         # Run database migrations
npm run db:generate        # Generate Prisma client
npm run db:studio          # Open Prisma Studio
npm run db:reset           # Reset database

# Code Quality
npm run lint               # Run ESLint
npm run format             # Format code with Prettier

# Testing
npm run test               # Run unit tests
npm run test:e2e           # Run e2e tests
npm run test:cov           # Run tests with coverage
```

## 🌱 Database Seeding

The application automatically seeds the database with:
- 5 AI services (Content Generation, Email Writer, Hook Generator, Image Generator, Post Scheduler)
- 3 subscription plans (Free, Pro, Business)
- Service limits and pricing

Seeding runs automatically in development mode when starting the server.

## 🔐 Authentication

The API uses JWT Bearer token authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 💰 Payment Integration

- Stripe integration for credit purchases
- Webhook handling for payment confirmations
- Automatic credit allocation upon successful payment

## 📊 Usage Tracking

- Real-time usage tracking per service
- Daily, weekly, and monthly usage periods
- Automatic limit enforcement
- Credit deduction for pay-as-you-go users

## 🚦 Error Handling

The API returns standardized error responses:
- `400` - Bad Request (validation errors, insufficient credits)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (access denied)
- `404` - Not Found
- `409` - Conflict (duplicate email, etc.)
- `500` - Internal Server Error

## 📝 API Documentation

Full interactive API documentation is available at `/api` when running the server. The documentation includes:
- All endpoints with request/response schemas
- Authentication requirements
- Example requests and responses
- Error codes and descriptions

## 🔄 Deployment

For production deployment:

1. Update environment variables for production
2. Set `NODE_ENV=production`
3. Build the application: `npm run build`
4. Start with: `npm run start:prod`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📜 License

This project is licensed under the UNLICENSED license.
