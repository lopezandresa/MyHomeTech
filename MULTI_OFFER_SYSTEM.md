# Multi-Offer System Implementation

## Overview
The service request system has been refactored to support **multiple counter-offers** from different technicians for each client request. This allows clients to receive and compare multiple offers before choosing the best one.

## Key Features

### For Clients:
- **View Multiple Offers**: Clients can see all offers received for their service requests, sorted from oldest to newest
- **Technician Information**: Each offer displays the technician's name and rating (placeholder for now)
- **Offer Details**: Price, timestamp, and optional comments from technicians
- **Accept Specific Offers**: Clients can accept any individual offer
- **Cancel Requests**: Clients can cancel their entire service request, removing it from technician view
- **Real-time Updates**: Clients receive immediate notifications when new offers arrive

### For Technicians:
- **Multiple Offers**: Multiple technicians can make offers on the same request
- **Offer Comments**: Technicians can include comments with their price offers
- **Real-time Notifications**: Technicians are notified when requests are accepted/rejected/canceled

## Technical Implementation

### Backend Changes

#### New Entity: ServiceRequestOffer
```typescript
@Entity()
export class ServiceRequestOffer {
  id: number
  serviceRequestId: number
  technicianId: number
  price: number
  status: 'pending' | 'accepted' | 'rejected'
  comment?: string
  createdAt: Date
  resolvedAt?: Date
  technician: Identity // Eager loaded
}
```

#### Updated ServiceRequest Entity
- Added `offers: ServiceRequestOffer[]` relation
- Maintains backward compatibility with existing fields

#### New Endpoints
- `POST /service-requests/:id/offer` - Technician makes an offer
- `GET /service-requests/client/:clientId` - Get client requests with all offers
- `POST /service-requests/:id/accept-offer/:offerId` - Accept specific offer
- `POST /service-requests/:id/cancel` - Cancel entire request

### Frontend Changes

#### Updated Types
```typescript
interface ServiceRequestOffer {
  id: number
  serviceRequestId: number
  technicianId: number
  price: number
  status: 'pending' | 'accepted' | 'rejected'
  comment?: string
  createdAt: string
  resolvedAt?: string
  technician: User // Identity/User object
}

interface ServiceRequest {
  // ...existing fields...
  offers?: ServiceRequestOffer[] // New field
}
```

#### Updated Dashboard UI
- Displays all offers in chronological order (oldest first)
- Shows technician information for each offer
- Individual "Accept" buttons for each offer
- "Cancel Request" button to cancel the entire service request
- Real-time updates when new offers arrive

#### Real-time Updates
- Client notifications hook updated to handle offer events
- Dashboard automatically reloads data when new offers are received
- Visual feedback for all actions

## User Flow

### Client Perspective
1. **Create Request**: Client creates a service request with their desired price
2. **Receive Offers**: Multiple technicians can make counter-offers
3. **Review Offers**: Client sees all offers sorted chronologically, with technician details
4. **Accept/Cancel**: Client can accept any specific offer or cancel the entire request
5. **Real-time Updates**: Client receives immediate notifications for new offers

### Technician Perspective
1. **View Available Requests**: See pending/offered requests from other clients
2. **Make Offers**: Submit price offers with optional comments
3. **Compete**: Multiple technicians can offer on the same request
4. **Get Notified**: Receive real-time updates when offers are accepted/rejected/canceled

## Status Flow
- `pending` → `offered` (when first offer is made)
- `offered` → `accepted` (when client accepts an offer)
- `offered` → `cancelled` (when client cancels request)
- Individual offers: `pending` → `accepted` or `rejected`

## Real-time Events
- **For Clients**: `service-request-offer` (new offer received)
- **For Technicians**: `service-request-removed` (request accepted/canceled by client)

## Testing
Two test scripts are available:
- `test-multi-offer-system.js` - Basic multi-offer functionality test
- `test-complete-multi-offer-flow.js` - Comprehensive end-to-end test

## Notes
- Rating system integration is prepared but shows placeholders currently
- All legacy single-offer code has been maintained for backward compatibility
- WebSocket connections handle real-time updates for both roles
- UI provides immediate visual feedback for all actions
