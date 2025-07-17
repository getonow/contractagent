# Contract Analysis React Component

A ready-to-use React component for integrating the Contract Analysis AI Agent into your frontend application.

## Features

- ✅ **Complete UI**: Form input, loading states, error handling
- ✅ **Responsive Design**: Works on desktop, tablet, and mobile
- ✅ **Professional Styling**: Modern, clean interface with animations
- ✅ **Structured Display**: Organized sections for all analysis data
- ✅ **Accessibility**: Proper labels, focus states, and semantic HTML
- ✅ **Print-Friendly**: Optimized for printing analysis results

## Quick Start

### 1. Copy the Files
Copy these two files to your React project:
- `ContractAnalysisComponent.jsx`
- `ContractAnalysisComponent.css`

### 2. Import and Use
```jsx
import React from 'react';
import ContractAnalysisComponent from './ContractAnalysisComponent';

function App() {
  return (
    <div className="App">
      <ContractAnalysisComponent />
    </div>
  );
}
```

### 3. Ensure Your Backend is Running
Make sure your contract analysis API is running on `http://localhost:3000` or update the fetch URL in the component.

## How It Works

1. **User Input**: Enter a part number (e.g., "PA-10001")
2. **API Call**: Component sends POST request to `/api/contracts/analyze`
3. **Loading State**: Shows spinner while processing
4. **Results Display**: Shows structured analysis in organized sections
5. **Error Handling**: Displays user-friendly error messages

## API Integration

The component expects your backend API to:
- Accept POST requests to `/api/contracts/analyze`
- Expect JSON body: `{ "partNumber": "PA-10001" }`
- Return success response with `analysis` object
- Return error response with `message` field

## Customization Options

### Change API Endpoint
```jsx
// In ContractAnalysisComponent.jsx, line ~25
const response = await fetch('/api/contracts/analyze', {
  // Change to your API URL
  // const response = await fetch('https://your-api.com/contracts/analyze', {
```

### Modify Styling
Edit `ContractAnalysisComponent.css` to match your brand colors:
```css
/* Change primary color */
button {
  background: linear-gradient(135deg, #your-color, #your-darker-color);
}

/* Change section headers */
.analysis-section h3 {
  color: #your-text-color;
}
```

### Add Additional Fields
To add more input fields (like supplier name):
```jsx
// Add state
const [supplierName, setSupplierName] = useState('');

// Add form field
<div className="form-group">
  <label htmlFor="supplierName">Supplier Name:</label>
  <input
    type="text"
    id="supplierName"
    value={supplierName}
    onChange={(e) => setSupplierName(e.target.value)}
    placeholder="Enter supplier name"
  />
</div>

// Update API call
body: JSON.stringify({ 
  partNumber: partNumber.trim(),
  supplierName: supplierName.trim() 
}),
```

## Component Structure

```
ContractAnalysisComponent
├── Form Input (Part Number)
├── Loading State (Spinner)
├── Error Display
└── Analysis Results
    ├── Supplier Overview
    ├── Part Information
    ├── Key Clauses
    ├── Risk Assessment
    ├── Contract Benchmarking
    ├── Negotiation Leverage
    ├── Compliance Check
    └── Summary & Recommendations
```

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+

## Dependencies

- React 16.8+ (for hooks)
- No external libraries required
- Uses native fetch API

## Troubleshooting

### CORS Issues
If you get CORS errors, ensure your backend has proper CORS headers:
```javascript
// In your Express server
app.use(cors());
```

### API Not Found
Make sure your backend is running and the endpoint is correct:
```bash
# Test your API
curl -X POST http://localhost:3000/api/contracts/analyze \
  -H "Content-Type: application/json" \
  -d '{"partNumber": "PA-10001"}'
```

### Styling Issues
If styles don't load, ensure the CSS file is in the same directory and imported correctly.

## Example Usage in Different Frameworks

### Next.js
```jsx
// pages/contracts.js
import ContractAnalysisComponent from '../components/ContractAnalysisComponent';

export default function ContractsPage() {
  return <ContractAnalysisComponent />;
}
```

### Create React App
```jsx
// src/App.js
import ContractAnalysisComponent from './components/ContractAnalysisComponent';

function App() {
  return (
    <div className="App">
      <ContractAnalysisComponent />
    </div>
  );
}
```

### Vite
```jsx
// src/App.jsx
import ContractAnalysisComponent from './components/ContractAnalysisComponent';

function App() {
  return (
    <div>
      <ContractAnalysisComponent />
    </div>
  );
}
```

## License

This component is provided as-is for integration with your contract analysis service. 