# CONTRACTEXTRACT AI Agent - Python FastAPI Migration

This repository has been successfully migrated from Node.js/Express to Python/FastAPI with Uvicorn server.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- pip (Python package manager)

### Installation

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your actual values
   ```

3. **Start the server:**
   ```bash
   # Option 1: Using the startup script
   python startup.py
   
   # Option 2: Using uvicorn directly
   uvicorn main:app --host 0.0.0.0 --reload
   
   # Option 3: Using the main file
   python main.py
   ```

## 📁 Project Structure

```
contractagent/
├── main.py                          # FastAPI application entry point
├── startup.py                       # Startup script
├── requirements.txt                 # Python dependencies
├── app/
│   ├── __init__.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── contract_routes.py      # Contract analysis endpoints
│   │   └── health_routes.py        # Health check endpoints
│   ├── services/
│   │   ├── __init__.py
│   │   ├── contract_service.py     # Main analysis logic
│   │   ├── supabase_service.py     # Supabase database operations
│   │   ├── astra_service.py        # DataStax Astra operations
│   │   ├── ai_service.py           # OpenAI integration
│   │   └── health_service.py       # Health check logic
│   └── utils/
│       ├── __init__.py
│       └── validation.py           # Validation utilities
├── env.example                      # Environment variables template
└── README-Python-Migration.md       # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# DataStax Astra Configuration
ASTRA_DB_ENDPOINT=your_astra_endpoint
ASTRA_DB_CLIENT_ID=your_astra_client_id
ASTRA_DB_SECRET=your_astra_secret
ASTRA_DB_TOKEN=your_astra_token
ASTRA_DB_KEYSPACE=default_keyspace
ASTRA_DB_COLLECTION=contracts

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
```

## 🛠️ API Endpoints

### Contract Analysis
- `POST /api/contracts/analyze` - Analyze contract for a part number
- `GET /api/contracts/status/{part_number}` - Get analysis status
- `GET /api/contracts/formats` - Get supported part number formats

### Health Checks
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed health check with system info

### Root
- `GET /` - API information and available endpoints

## 🔄 Migration Summary

### What Changed
1. **Server**: Node.js/Express → Python/FastAPI with Uvicorn
2. **Validation**: Joi → Pydantic models
3. **Async**: Promises → Python async/await
4. **Error Handling**: Express middleware → FastAPI exception handlers
5. **CORS**: Express CORS → FastAPI CORS middleware

### What Stayed the Same
1. **API Endpoints**: All endpoints maintain the same paths and responses
2. **Business Logic**: All analysis logic is preserved
3. **Database Integration**: Supabase and Astra connections work the same
4. **AI Integration**: OpenAI integration maintains the same functionality
5. **Environment Variables**: Same configuration structure

## 🧪 Testing

### Test the API locally:
```bash
# Start the server
python startup.py

# Test health endpoint
curl http://localhost:3000/api/health

# Test contract analysis
curl -X POST http://localhost:3000/api/contracts/analyze \
  -H "Content-Type: application/json" \
  -d '{"partNumber": "PA-10100"}'
```

### Test with your frontend:
Update your frontend environment to point to the Python backend:
```env
VITE_CONTRACT_AGENT_API_URL=http://localhost:3000
```

## 🚀 Deployment

### Local Development
```bash
python startup.py
```

### Production Deployment
```bash
# Set production environment
export NODE_ENV=production

# Start without auto-reload
uvicorn main:app --host 0.0.0.0
```

### Docker Deployment
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 3000

CMD ["python", "startup.py"]
```

## 🔍 Troubleshooting

### Common Issues

1. **Import Errors**: Make sure all dependencies are installed
   ```bash
   pip install -r requirements.txt
   ```

2. **Environment Variables**: Check that your `.env` file is properly configured

3. **Database Connections**: Verify Supabase and Astra credentials

4. **CORS Issues**: The CORS configuration includes your deploypad.app domains

### Logs
The server provides detailed logging for debugging:
- Request/response logging
- Database connection status
- AI analysis progress
- Error details

## 📊 Performance

### Benefits of Python/FastAPI Migration
1. **Better Performance**: FastAPI is one of the fastest Python web frameworks
2. **Type Safety**: Pydantic provides runtime type validation
3. **Auto Documentation**: Automatic OpenAPI/Swagger documentation
4. **Async Support**: Native async/await support for better concurrency
5. **Modern Python**: Uses modern Python features and best practices

## 🔗 Integration

### Frontend Integration
Your existing frontend should work without changes. The API maintains the same:
- Request/response formats
- Error handling
- CORS configuration
- Endpoint paths

### Database Integration
- **Supabase**: PostgreSQL operations via Supabase client
- **DataStax Astra**: Cassandra operations via cassandra-driver
- **OpenAI**: GPT-4 integration for contract analysis

## 📝 Development

### Adding New Endpoints
1. Create route in `app/routes/`
2. Add Pydantic models for request/response validation
3. Implement business logic in `app/services/`
4. Update main.py to include the new router

### Adding New Services
1. Create service file in `app/services/`
2. Implement async functions
3. Import and use in route handlers

## 🎯 Next Steps

1. **Deploy the Python backend** to your hosting platform
2. **Update frontend environment** to point to the new backend
3. **Test all functionality** to ensure migration success
4. **Monitor performance** and optimize as needed

## 📞 Support

If you encounter any issues with the migration:
1. Check the logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test database connections individually
4. Ensure all Python dependencies are installed

---

**Migration completed successfully!** 🎉

Your backend is now running on Python/FastAPI with Uvicorn, providing the same functionality as the original Node.js/Express version with improved performance and modern Python features. 