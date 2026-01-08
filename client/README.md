# Dialysis CRM Frontend (Craft4Dev)

## Setup
1) Extract zip
2) `npm install`
3) Copy `.env.example` -> `.env` and set backend:
   - `VITE_API_BASE_URL=http://localhost:5000/api`  (match your backend port)
4) `npm run dev`

## Routes Included (All Phases)
- Staff: /staff/* (dashboard, patients, beds, shifts, schedules, lifecycle, maintenance, billing, referrals, settings)
- Patient: /patient/* (dashboard, profile, schedule)

## Notes
- Schedules/Billing/Referrals/Settings use JSON payload forms so they work with your exact backend schema.
- Tokens:
  - Staff token stored in localStorage key: `token`
  - Patient token stored in localStorage key: `patientToken`
