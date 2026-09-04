# Shared Contracts & DTOs

This package contains the single source of truth for:
- TypeScript Interfaces & Types
- Enums (`Role`, `Category`, `VerificationStatus`, `BudgetBand`, `EventType`)
- Zod validation schemas for all REST endpoints
- Recommendation Engine score breakdown & response contracts
- AI Reasoning payload and response schemas

## Usage
Both `/frontend` and `/backend` import types and schemas from `@experience-platform/shared`.
