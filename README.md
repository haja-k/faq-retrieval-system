# FAQ Retrieval System

A full-stack AI-powered FAQ retrieval system with admin dashboard built with NestJS, PostgreSQL, and Next.js.

## Features

- **Backend (NestJS + PostgreSQL)**
  - CRUD API for FAQ management
  - Intelligent FAQ retrieval with scoring algorithm
  - `/ask` endpoint with confidence threshold and ambiguity detection
  - Database health checks
  - Unit tests for scoring functionality
  - Database seeding

- **Frontend (Next.js)**
  - Admin dashboard with authentication
  - FAQ management (Create, Read, Update, Delete)
  - Live testing interface for `/ask` endpoint
  - Responsive UI with Tailwind CSS

## Setup and Installation

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)

### Quick Start with Docker

1. **Clone and setup the project:**
   ```bash
   git clone <repository-url>
   cd faq-retrieval-system
   ```

2. **Create environment files:**
   ```bash
   # Backend
   cd backend
   cp .env.example .env
   
   # Frontend
   cd ../frontend
   cp .env.example .env
   cd ..
   ```

3. **Start all services:**
   ```bash
   docker-compose up --build
   ```

4. **Seed the database:**
   ```bash
   # Wait for services to start, then run:
   docker-compose exec backend npm run seed
   ```

### Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **Database:** localhost:5432

**Login Credentials:**
- Username: `admin`
- Password: `admin`

### API Endpoints

- `GET /health` - Health check
- `GET /health/db` - Database connection check
- `GET /faqs` - List all FAQs
- `POST /faqs` - Create new FAQ
- `GET /faqs/:id` - Get FAQ by ID
- `PATCH /faqs/:id` - Update FAQ
- `DELETE /faqs/:id` - Delete FAQ
- `POST /faqs/ask` - Query FAQs (main retrieval endpoint)

## Scoring Algorithm

The FAQ retrieval uses a hybrid scoring approach:

1. **Keyword Overlap Scoring**: Counts matching words between query and FAQ content
   - Question matches weighted at 60%
   - Answer matches weighted at 20%
   - Normalized by query length

2. **Tag Matching**: Direct tag overlap scoring weighted at 20%
   - Matches query keywords against FAQ tags
   - Accounts for partial tag matches

3. **Confidence Filtering**: Results below 0.3 threshold return fallback message

4. **Ambiguity Detection**: When multiple high-scoring results (>80% of top score) come from different tag categories, marks response as ambiguous

## Testing the `/ask` Endpoint

### Using the Frontend
1. Login to the admin dashboard
2. Use the "Test Ask Functionality" box at the top
3. Try queries like:
   - "opening hours" 
   - "how to book appointment"
   - "parking location"

### Using API directly
```bash
curl -X POST http://localhost:3001/faqs/ask \
  -H "Content-Type: application/json" \
  -d '{"text": "what are your opening hours"}'
```

### Example Responses

**Successful Match:**
```json
{
  "results": [
    {
      "id": 1,
      "question": "What are your opening hours?",
      "answer": "We are open Monday to Friday from 9:00 AM to 6:00 PM...",
      "tags": ["hours", "schedule", "opening"],
      "score": 0.85
    }
  ]
}
```

**Ambiguous Query:**
```json
{
  "results": [...],
  "ambiguous": true
}
```

**No Match:**
```json
{
  "results": [],
  "message": "Not sure, please contact staff."
}
```

## Running Tests

```bash
# Backend unit tests
docker-compose exec backend npm test

# Or locally
cd backend
npm test
```

## Development

### Local Development (without Docker)

1. **Start PostgreSQL:**
   ```bash
   docker run --name postgres-faq -e POSTGRES_PASSWORD=password -e POSTGRES_DB=faq_db -p 5432:5432 -d postgres:15
   ```

2. **Backend:**
   ```bash
   cd backend
   npm install
   npm run seed
   npm run start:dev
   ```

3. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Seed Data

The system comes with 6 pre-configured FAQs covering:
- Opening Hours (hours)
- Booking/Reschedule (booking) 
- Location & Parking (location)
- Vaccinations (services, vaccination)
- Billing & Payments (billing)
- WhatsApp Support (support)

## Architecture

### Backend Structure
```
src/
├── faq/
│   ├── entities/faq.entity.ts
│   ├── dto/index.ts
│   ├── faq.service.ts
│   ├── faq.controller.ts
│   └── faq.module.ts
├── health/
├── seeds/
└── main.ts
```

### Frontend Structure
```
app/
├── page.tsx (login)
├── dashboard/page.tsx
├── layout.tsx
└── globals.css
lib/
└── api.ts
```

## Technologies Used

- **Backend**: NestJS, TypeORM, PostgreSQL
- **Frontend**: Next.js 14, React, Tailwind CSS
- **Infrastructure**: Docker, Docker Compose
- **Testing**: Jest

## Nice-to-have Features Implemented

- ✅ Ambiguity handling with `ambiguous: true` flag
- ✅ Basic language support parameter (lang filter)
- ✅ Unit tests for scoring function
- ✅ Health check endpoints
- ✅ Docker containerization
- ✅ Database seeding

## Performance Considerations

- Scoring algorithm is O(n*m) where n = number of FAQs, m = average content length
- For production, consider implementing:
  - Elasticsearch/vector search for better performance
  - Caching layer for frequent queries
  - Database indexing on frequently searched fields