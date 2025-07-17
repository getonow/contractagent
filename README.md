# CONTRACTEXTRACT AI Agent

An expert AI agent for Contract Analysis and Negotiations that analyzes supplier contracts and provides strategic insights for procurement teams.

## 🚀 Features

- **Part Number Lookup**: Validates and searches for parts in the MASTER_FILE table
- **Supplier Information Extraction**: Retrieves comprehensive supplier details
- **Contract Analysis**: Searches and analyzes contracts from DataStax Astra Vector database
- **AI-Powered Insights**: Uses OpenAI to provide structured contract analysis
- **Structured Response**: Returns organized analysis in JSON format for frontend integration

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Access to:
  - Supabase Postgres database (MASTER_FILE table)
  - DataStax Astra Vector database (contracts collection)
  - OpenAI API

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd contractagent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Supabase Configuration (Postgres Database)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

   # DataStax Astra Vector Database Configuration
   ASTRA_DB_ENDPOINT=your_astra_endpoint_here
ASTRA_DB_CLIENT_ID=your_astra_client_id_here
ASTRA_DB_SECRET=your_astra_secret_here
   ASTRA_DB_TOKEN=your_astra_token_here
   ASTRA_DB_KEYSPACE=default_keyspace
   ASTRA_DB_COLLECTION=contracts

   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 📡 API Endpoints

### Health Check
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed health check with system info

### Contract Analysis
- `POST /api/contracts/analyze` - Main contract analysis endpoint
- `GET /api/contracts/status/:partNumber` - Check analysis status
- `GET /api/contracts/formats` - Get supported part number formats

## 🔍 Usage Examples

### Analyze a Contract

```bash
curl -X POST http://localhost:3000/api/contracts/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "partNumber": "PA-10183"
  }'
```

### Response Structure

```json
{
  "success": true,
  "partNumber": "PA-10183",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "analysis": {
    "supplierOverview": {
      "supplierName": "Alpine Injection GmbH",
      "supplierNumber": "SUP018",
      "supplierContact": {
        "name": "Maria Lopez",
        "email": "maria.lopez@alpine.com"
      },
      "manufacturingLocation": "Lyon, France",
      "numberOfContractsFound": 3,
      "dateRangeOfContracts": "2023-2025"
    },
    "partInformation": {
      "partNumber": "PA-10183",
      "partName": "Injection Molding Part",
      "material": "PP unfilled",
      "currency": "EUR"
    },
    "keyClausesIdentification": {
      "confidentiality": "Mutual confidentiality obligations, balanced",
      "terminationConditions": "30-day notice required",
      "paymentTerms": "Net 30 days",
      "liabilitiesAndIndemnities": "Standard liability limits",
      "penaltiesAndSLAs": "Performance-based penalties",
      "disputeResolution": "Arbitration in Lyon, France"
    },
    "riskAssessmentAndMitigation": {
      "identifiedRisks": [
        "Currency fluctuation risk",
        "Supply chain disruption risk"
      ],
      "recommendationsToMitigateRisks": [
        "Implement currency hedging",
        "Develop backup suppliers"
      ]
    },
    "contractBenchmarkingAndPrecedentBasedInsights": {
      "industryBenchmarkComparison": "Terms align with industry standards",
      "insightsFromPreviousNegotiations": "Supplier responsive to volume commitments"
    },
    "negotiationLeveragePoints": {
      "keyLeveragePoints": [
        "Long-term relationship",
        "Volume commitments"
      ],
      "recommendedNegotiationTactics": [
        "Leverage volume for better pricing",
        "Request extended payment terms"
      ]
    },
    "complianceCheck": {
      "regulatoryComplianceStatus": "Compliant with EU regulations"
    },
    "summaryAndStrategicRecommendations": {
      "keyInsights": [
        "Strong supplier relationship",
        "Competitive pricing"
      ],
      "recommendedActions": [
        "1. Negotiate volume-based pricing",
        "2. Extend contract term"
      ],
      "nextSteps": [
        "Schedule negotiation meeting",
        "Prepare counter-proposals"
      ]
    }
  }
}
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend UI   │    │  Express API    │    │   OpenAI API    │
│                 │◄──►│   Server        │◄──►│                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Services      │
                       │                 │
                       │ • Supabase      │
                       │ • Astra         │
                       │ • AI Analysis   │
                       └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Databases     │
                       │                 │
                       │ • Postgres      │
                       │ • Vector DB     │
                       └─────────────────┘
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3000) |
| `NODE_ENV` | Environment mode | No (default: development) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `ASTRA_DB_ENDPOINT` | DataStax Astra endpoint | Yes |
| `ASTRA_DB_TOKEN` | DataStax Astra token | Yes |
| `ASTRA_DB_KEYSPACE` | Astra keyspace name | Yes |
| `ASTRA_DB_COLLECTION` | Astra collection name | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |

### Part Number Format

The agent accepts part numbers in the format: `PA-XXXXX`
- Prefix: `PA-` (fixed)
- Suffix: 5-digit number (00000-99999)
- Example: `PA-10183`

## 🧪 Testing

```bash
# Run tests
npm test

# Test health endpoint
curl http://localhost:3000/api/health

# Test contract analysis
curl -X POST http://localhost:3000/api/contracts/analyze \
  -H "Content-Type: application/json" \
  -d '{"partNumber": "PA-10183"}'
```

## 📊 Database Schema

### MASTER_FILE Table (Supabase Postgres)

Key columns for the agent:
- `PartNumber`: Unique part identifier
- `suppliername`: Supplier company name
- `suppliernumber`: Supplier code
- `suppliercontactname`: Contact person name
- `suppliercontactemail`: Contact email
- `suppliermanufacturinglocation`: Manufacturing location
- `partname`: Part description
- `material`: Material type
- `currency`: Pricing currency
- Volume columns: `voljan2023` through `voldec2025`
- Price columns: `pricejan2023` through `pricedec2025`

### Contracts Collection (DataStax Astra)

- `_id`: Document identifier
- `$vectorize`: Contract text content
- `$vector`: Vector embeddings
- `$similarity`: Similarity score

## 🚨 Error Handling

The API returns structured error responses:

```json
{
  "error": "Part not found",
  "message": "Part number PA-99999 not found in MASTER_FILE table",
  "partNumber": "PA-99999",
  "suggestions": [
    "Verify the part number is correct",
    "Check if the part number exists in the MASTER_FILE table"
  ]
}
```

## 🔒 Security

- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet security headers
- Input validation
- Error sanitization

## 📈 Monitoring

- Health check endpoints
- Request logging
- Error tracking
- Performance monitoring

## 🤝 Integration

### Frontend Integration

```javascript
// Example frontend integration
const analyzeContract = async (partNumber) => {
  try {
    const response = await fetch('/api/contracts/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ partNumber })
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Analysis failed:', error);
    throw error;
  }
};
```

## 📝 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the health endpoint: `/api/health/detailed`
2. Review error logs
3. Verify API keys and database connections
4. Test with a known valid part number

## 🔄 Updates

To update the service:
1. Pull latest changes
2. Update dependencies: `npm install`
3. Restart the server
4. Test with health endpoint 