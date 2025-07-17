# Railway Deployment Guide

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Account**: Your code should be in a GitHub repository
3. **Environment Variables**: Prepare your production environment variables

## Step 1: Prepare Your Repository

Your repository should now contain these deployment files:
- `Procfile` - Tells Railway how to run your app
- `runtime.txt` - Specifies Python version
- `railway.json` - Railway-specific configuration
- `requirements.txt` - Python dependencies

## Step 2: Deploy to Railway

### Option A: Deploy via Railway Dashboard

1. **Connect GitHub Repository**:
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

2. **Configure Environment Variables**:
   - In your Railway project dashboard, go to "Variables" tab
   - Add all environment variables from your `.env` file:
   ```
   NODE_ENV=production
   PORT=3000
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   ASTRA_DB_ENDPOINT=your_astra_endpoint
   ASTRA_DB_CLIENT_ID=your_astra_client_id
   ASTRA_DB_SECRET=your_astra_secret
   ASTRA_DB_TOKEN=your_astra_token
   ASTRA_DB_KEYSPACE=default_keyspace
   ASTRA_DB_COLLECTION=contracts
   OPENAI_API_KEY=your_openai_api_key
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

3. **Deploy**:
   - Railway will automatically detect your Python app
   - It will install dependencies from `requirements.txt`
   - Your app will be deployed and get a public URL

### Option B: Deploy via Railway CLI

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Deploy**:
   ```bash
   railway login
   railway init
   railway up
   ```

## Step 3: Configure Custom Domain (Optional)

1. In Railway dashboard, go to "Settings" → "Domains"
2. Add your custom domain
3. Configure DNS records as instructed

## Step 4: Test Your Deployment

Your API will be available at:
- Railway URL: `https://your-app-name.railway.app`
- Custom domain (if configured): `https://your-domain.com`

### Test Endpoints:
- Health check: `GET https://your-app-name.railway.app/api/health`
- Root: `GET https://your-app-name.railway.app/`
- Contract analysis: `POST https://your-app-name.railway.app/api/contracts/analyze`

## Step 5: Update CORS for Production

Your API is already configured to allow requests from:
- Railway domains (`*.railway.app`)
- Vercel domains (`*.vercel.app`)
- Netlify domains (`*.netlify.app`)
- Heroku domains (`*.herokuapp.com`)

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Set to `production` | Yes |
| `PORT` | Port for the application | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `ASTRA_DB_ENDPOINT` | DataStax Astra endpoint | Yes |
| `ASTRA_DB_CLIENT_ID` | Astra client ID | Yes |
| `ASTRA_DB_SECRET` | Astra client secret | Yes |
| `ASTRA_DB_TOKEN` | Astra token | Yes |
| `ASTRA_DB_KEYSPACE` | Astra keyspace | Yes |
| `ASTRA_DB_COLLECTION` | Astra collection name | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `RATE_LIMIT_WINDOW_MS` | Rate limiting window | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | No |

## Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check that all dependencies are in `requirements.txt`
   - Verify Python version in `runtime.txt`

2. **Environment Variables**:
   - Ensure all required variables are set in Railway dashboard
   - Check for typos in variable names

3. **CORS Issues**:
   - Verify your frontend domain is in the allowed origins
   - Check that `NODE_ENV=production` is set

4. **Database Connection Issues**:
   - Verify all database credentials are correct
   - Check that your database allows connections from Railway's IP ranges

### Monitoring:

- Use Railway's built-in logs to debug issues
- Monitor your app's performance in the Railway dashboard
- Set up alerts for downtime or errors

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to your repository
2. **API Keys**: Use Railway's secure environment variable storage
3. **CORS**: Only allow necessary origins in production
4. **Rate Limiting**: Consider implementing rate limiting for production use

## Cost Optimization

- Railway offers a free tier with limitations
- Monitor your usage in the Railway dashboard
- Consider upgrading to paid plans for production workloads 