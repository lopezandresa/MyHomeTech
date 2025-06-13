import React, { useState } from 'react'
import { serviceRequestService } from '../services/serviceRequestService'

interface MultiOfferDebugProps {
  clientId?: number
  technicianId?: number
}

export const MultiOfferDebug: React.FC<MultiOfferDebugProps> = ({ 
  clientId, 
  technicianId 
}) => {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testClientRequests = async () => {
    if (!clientId) return
    setLoading(true)
    try {
      const requests = await serviceRequestService.getClientRequests(clientId)
      setResult(JSON.stringify(requests, null, 2))
    } catch (error) {
      setResult(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testOfferCreation = async () => {
    if (!technicianId) return
    setLoading(true)
    try {
      // This would need a specific request ID - just for demonstration
      const requestId = 1 // This should be dynamic in real use
      await serviceRequestService.offerPrice(requestId, {
        technicianPrice: 125000,
        comment: 'Debug test offer'
      })
      setResult('Offer submitted successfully!')
    } catch (error) {
      setResult(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  if (!clientId && !technicianId) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-600">Multi-offer debug panel (no user ID provided)</p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h3 className="font-semibold text-blue-800 mb-3">Multi-Offer Debug Panel</h3>
      
      <div className="space-y-3">
        {clientId && (
          <button
            onClick={testClientRequests}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Test Client Requests'}
          </button>
        )}

        {technicianId && (
          <button
            onClick={testOfferCreation}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Test Offer Creation'}
          </button>
        )}
      </div>

      {result && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Result:</h4>
          <pre className="bg-white p-3 rounded border text-xs overflow-auto max-h-64">
            {result}
          </pre>
        </div>
      )}
      
      <div className="mt-3 text-sm text-gray-600">
        {clientId && <p>Client ID: {clientId}</p>}
        {technicianId && <p>Technician ID: {technicianId}</p>}
      </div>
    </div>
  )
}
