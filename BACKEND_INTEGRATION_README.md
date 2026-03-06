
# Backend Integration Requirements for Branded By Kyle

## Overview
This document outlines the backend API endpoints required for the booking system to function properly. The frontend is already built and ready to integrate with these endpoints.

## Database Schema

### appointments table
```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service TEXT DEFAULT 'Custom Tattoo',
  appointmentDate TIMESTAMPTZ NOT NULL,
  appointmentTime TEXT NOT NULL,
  consultationDate TIMESTAMPTZ,
  consultationTime TEXT,
  description TEXT NOT NULL,
  placement TEXT,
  size TEXT,
  referenceImages JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending deposit',
  depositPaid BOOLEAN NOT NULL DEFAULT false,
  depositAmount INTEGER NOT NULL DEFAULT 100,
  paymentConfirmedAt TIMESTAMPTZ,
  squarePaymentId TEXT,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Required API Endpoints

### 1. Create Appointment
**POST /api/appointments**

Request Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "(555) 123-4567",
  "service": "Custom Tattoo",
  "appointmentDate": "2024-03-15T14:00:00Z",
  "appointmentTime": "2:00 PM",
  "consultationDate": "2024-03-13T10:00:00Z",
  "consultationTime": "10:00 AM",
  "description": "Dragon tattoo on upper arm",
  "placement": "Upper arm",
  "size": "6x8 inches",
  "referenceImages": ["https://example.com/image1.jpg"]
}
```

Response (201):
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "(555) 123-4567",
  "appointmentDate": "2024-03-15T14:00:00Z",
  "appointmentTime": "2:00 PM",
  "consultationDate": "2024-03-13T10:00:00Z",
  "consultationTime": "10:00 AM",
  "description": "Dragon tattoo on upper arm",
  "placement": "Upper arm",
  "size": "6x8 inches",
  "status": "pending deposit",
  "depositPaid": false,
  "depositAmount": 100,
  "createdAt": "2024-03-10T10:00:00Z"
}
```

### 2. Get All Appointments
**GET /api/appointments**

Response (200):
```json
[
  {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "(555) 123-4567",
    "appointmentDate": "2024-03-15T14:00:00Z",
    "appointmentTime": "2:00 PM",
    "consultationDate": "2024-03-13T10:00:00Z",
    "consultationTime": "10:00 AM",
    "description": "Dragon tattoo",
    "placement": "Upper arm",
    "size": "6x8 inches",
    "status": "pending deposit",
    "depositPaid": false,
    "depositAmount": 100,
    "paymentConfirmedAt": null,
    "createdAt": "2024-03-10T10:00:00Z",
    "updatedAt": "2024-03-10T10:00:00Z"
  }
]
```

### 3. Check Availability
**GET /api/appointments/availability?date=2024-03-15**

Response (200):
```json
{
  "date": "2024-03-15",
  "bookedSlots": [
    "2024-03-15T14:00:00Z",
    "2024-03-15T16:00:00Z"
  ]
}
```

### 4. Update Appointment Status
**PUT /api/appointments/:id/status**

Request Body:
```json
{
  "status": "approved"
}
```

Response (200):
```json
{
  "id": "uuid",
  "status": "approved",
  "updatedAt": "2024-03-10T11:00:00Z"
}
```

**Important:** If status is "approved" AND depositPaid is true, automatically send confirmation email to client.

### 5. Square Payment Webhook
**POST /api/appointments/:id/deposit-webhook**

This endpoint should be registered with Square as a webhook URL.

Request Body (from Square):
```json
{
  "paymentId": "square_payment_id",
  "status": "completed",
  "amount": 10000,
  "paidAt": "2024-03-10T10:30:00Z"
}
```

Actions:
1. Update appointment:
   - depositPaid = true
   - paymentConfirmedAt = paidAt
   - squarePaymentId = paymentId
   - status = 'pending' (move from 'pending deposit' to 'pending')
2. Send "Deposit Received" email to client

Response (200):
```json
{
  "success": true,
  "appointmentId": "uuid",
  "depositPaid": true
}
```

### 6. Send Confirmation Email
**POST /api/appointments/:id/send-confirmation**

Request Body:
```json
{}
```

Response (200):
```json
{
  "success": true,
  "emailSent": true
}
```

## Email Templates

### Deposit Received Email
**Trigger:** Automatically sent when Square webhook confirms payment

**To:** Client email
**Subject:** "Deposit Received - Your Branded By Kyle Booking"

**Body:**
```
Hi {name},

Your $100 deposit has been received! ✓

Your booking is now confirmed and pending Kyle's approval.

BOOKING DETAILS:
- Appointment Date: {appointmentDate formatted}
- Appointment Time: {appointmentTime}
- Consultation: {consultationDate formatted} at {consultationTime}
- Description: {description}
- Placement: {placement}
- Size: {size}

NEXT STEPS:
1. Kyle will review your appointment request
2. You will receive another email once approved
3. Your consultation will be scheduled

IMPORTANT:
- Deposit is non-refundable
- Remaining balance ($150/hr) due at time of service
- 48 hours notice required for cancellations

Questions? Contact Kyle at brandedbykyle@gmail.com

Thank you for choosing Branded By Kyle!

- Kyle
```

### Appointment Approved Email
**Trigger:** Sent when admin approves appointment (status changed to 'approved')

**To:** Client email
**Subject:** "Appointment Approved - Branded By Kyle"

**Body:**
```
Hi {name},

Great news! Kyle has approved your tattoo appointment! ✓

CONFIRMED BOOKING:
- Appointment Date: {appointmentDate formatted}
- Appointment Time: {appointmentTime}
- Consultation: {consultationDate formatted} at {consultationTime}
- Location: [Kyle's studio address]

Kyle will contact you soon to confirm final details and schedule your consultation.

See you soon!

- Kyle
```

## Square Payment Integration

### Payment Link
The app uses this Square payment link: `https://square.link/u/sAU6Bf87`

### Webhook Setup
1. Register webhook URL with Square: `https://your-backend.com/api/appointments/{appointmentId}/deposit-webhook`
2. Subscribe to payment events: `payment.created`, `payment.updated`
3. When payment is confirmed, Square will POST to the webhook URL
4. Backend should update the appointment and send confirmation email

### Important Notes
- All timestamps must be in ISO 8601 format
- Webhook should be idempotent (handle duplicate calls)
- Email sending should be async and not block responses
- Log all webhook calls for debugging

## Frontend Configuration

The frontend expects the backend API URL to be set in the environment variable:
```
EXPO_PUBLIC_API_URL=https://your-backend-url.com
```

If not set, it defaults to `https://your-backend-url.com` (which will fail - you need to set the actual URL).

## Testing the Integration

1. **Create Appointment:** Submit booking form → Check database for new record with status='pending deposit'
2. **Payment Flow:** Click "Pay Deposit" → Opens Square link → Complete payment → Check webhook received → Check status updated to 'pending' and depositPaid=true → Check email sent
3. **Admin Approval:** Admin approves appointment → Check status updated to 'approved' → Check confirmation email sent
4. **Availability:** Change date in booking form → Check API called with correct date → Check booked slots displayed

## Error Handling

All endpoints should return proper error responses:

- 400: Validation error
  ```json
  { "error": "Validation error message" }
  ```

- 404: Not found
  ```json
  { "error": "Appointment not found" }
  ```

- 500: Server error
  ```json
  { "error": "Internal server error" }
  ```

## Current Status

✅ Frontend is complete and ready
✅ Local fallback using AsyncStorage works
⏳ Backend API needs to be implemented
⏳ Square webhook needs to be configured
⏳ Email service needs to be set up

Once the backend is deployed, update the `EXPO_PUBLIC_API_URL` environment variable and the app will automatically start using the backend API.
