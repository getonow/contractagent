import React, { useState } from 'react';
import './ContractAnalysisComponent.css';

const ContractAnalysisComponent = () => {
  const [partNumber, setPartNumber] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!partNumber.trim()) return;

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      // Use environment variable for API URL, fallback to localhost
      const apiUrl = import.meta.env.VITE_CONTRACT_AGENT_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/contracts/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ partNumber: partNumber.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        setAnalysis(data.analysis);
      } else {
        setError(data.message || 'Analysis failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const AnalysisSection = ({ title, data, isArray = false }) => (
    <div className="analysis-section">
      <h3>{title}</h3>
      {isArray ? (
        <ul>
          {data.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      ) : (
        <div className="section-content">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="section-item">
              <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong>
              {Array.isArray(value) ? (
                <ul>
                  {value.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              ) : (
                <span>{value}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="contract-analysis-container">
      <h1>Contract Analysis AI Agent</h1>
      
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="analysis-form">
        <div className="form-group">
          <label htmlFor="partNumber">Part Number:</label>
          <input
            type="text"
            id="partNumber"
            value={partNumber}
            onChange={(e) => setPartNumber(e.target.value)}
            placeholder="Enter part number (e.g., PA-10001)"
            disabled={loading}
            required
          />
        </div>
        <button type="submit" disabled={loading || !partNumber.trim()}>
          {loading ? 'Analyzing...' : 'Analyze Contracts'}
        </button>
      </form>

      {/* Loading State */}
      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Analyzing contracts for {partNumber}...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error">
          <h3>❌ Error</h3>
          <p>{error}</p>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="analysis-results">
          <h2>📊 Analysis Results</h2>
          
          {/* Supplier Overview */}
          <AnalysisSection title="🏭 Supplier Overview" data={analysis.supplierOverview} />
          
          {/* Part Information */}
          <AnalysisSection title="🔧 Part Information" data={analysis.partInformation} />
          
          {/* Key Clauses */}
          <AnalysisSection title="📋 Key Clauses Identification" data={analysis.keyClausesIdentification} />
          
          {/* Risk Assessment */}
          <div className="analysis-section">
            <h3>⚠️ Risk Assessment & Mitigation</h3>
            <div className="section-content">
              <div className="section-item">
                <strong>Identified Risks:</strong>
                <ul>
                  {analysis.riskAssessmentAndMitigation.identifiedRisks.map((risk, index) => (
                    <li key={index}>{risk}</li>
                  ))}
                </ul>
              </div>
              <div className="section-item">
                <strong>Recommendations to Mitigate Risks:</strong>
                <ul>
                  {analysis.riskAssessmentAndMitigation.recommendationsToMitigateRisks.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          {/* Benchmarking */}
          <AnalysisSection title="📈 Contract Benchmarking" data={analysis.contractBenchmarkingAndPrecedentBasedInsights} />
          
          {/* Negotiation Leverage */}
          <div className="analysis-section">
            <h3>💼 Negotiation Leverage Points</h3>
            <div className="section-content">
              <div className="section-item">
                <strong>Key Leverage Points:</strong>
                <ul>
                  {analysis.negotiationLeveragePoints.keyLeveragePoints.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              </div>
              <div className="section-item">
                <strong>Recommended Negotiation Tactics:</strong>
                <ul>
                  {analysis.negotiationLeveragePoints.recommendedNegotiationTactics.map((tactic, index) => (
                    <li key={index}>{tactic}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          {/* Compliance */}
          <AnalysisSection title="✅ Compliance Check" data={analysis.complianceCheck} />
          
          {/* Summary */}
          <div className="analysis-section">
            <h3>🎯 Summary & Strategic Recommendations</h3>
            <div className="section-content">
              <div className="section-item">
                <strong>Key Insights:</strong>
                <ul>
                  {analysis.summaryAndStrategicRecommendations.keyInsights.map((insight, index) => (
                    <li key={index}>{insight}</li>
                  ))}
                </ul>
              </div>
              <div className="section-item">
                <strong>Recommended Actions:</strong>
                <ul>
                  {analysis.summaryAndStrategicRecommendations.recommendedActions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>
              <div className="section-item">
                <strong>Next Steps:</strong>
                <ul>
                  {analysis.summaryAndStrategicRecommendations.nextSteps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractAnalysisComponent; 