# Check-In/Check-Out System Implementation

## Overview
Students can now scan their QR code **twice** - once when leaving the hostel (check-out) and again when returning (check-in). The same QR token works for both actions, and the system automatically tracks which action is being performed.

## How It Works

### 1. Student Workflow
1. **Get Approval**: Student requests permission → Goes through approval workflow (EB → President → Faculty Admin)
2. **Faculty Approves**: Faculty admin approval generates a JWT-based QR token
3. **View Pass**: Student opens their verified pass screen showing the QR code
4. **Check-Out**: When leaving hostel, guard scans QR → System records `checkOutAt` timestamp
5. **Check-In**: When returning to hostel, guard scans SAME QR → System records `checkInAt` timestamp
6. **Complete**: Pass is now fully used and cannot be scanned again

### 2. Guard Scanner Behavior
The guard scanner automatically determines the action based on database state:

#### First Scan (Check-Out)
- **Condition**: `checkOutAt` is NULL
- **Action**: Sets `checkOutAt` and `checkOutBy` fields
- **Display**: Green "EXIT AUTHORIZED" screen
- **Shows**: Student details, exit time, check-out timestamp

#### Second Scan (Check-In)
- **Condition**: `checkOutAt` exists but `checkInAt` is NULL
- **Action**: Sets `checkInAt` and `checkInBy` fields
- **Display**: Blue "WELCOME BACK" screen
- **Shows**: Student details, check-out time, check-in time, total duration out of hostel

#### Third Scan (Rejected)
- **Condition**: Both `checkOutAt` and `checkInAt` exist
- **Action**: Rejected
- **Display**: Red "ACCESS DENIED" - Pass already fully used
- **Shows**: Error message with both timestamps

## Database Changes

### New Fields in `PermissionRequest` Model
```prisma
checkOutAt  DateTime?  // When student scanned QR to exit hostel
checkOutBy  String?    // Guard ID who verified exit
checkInAt   DateTime?  // When student scanned QR to return
checkInBy   String?    // Guard ID who verified return
```

**Note**: `verifiedAt` and `verifiedBy` fields are kept for backwards compatibility. `verifiedAt` is set to `checkOutAt` on first scan.

## API Changes

### Modified Endpoint: `POST /api/guard/verify-qr`

**Request Body:**
```json
{
  "qrToken": "JWT_TOKEN_STRING",
  "guardId": "guard-001"
}
```

**Response (Check-Out):**
```json
{
  "success": true,
  "action": "check-out",
  "message": "Student authorized to exit hostel",
  "student": {
    "name": "John Doe",
    "rollNo": "CS21B034",
    "hostel": "CS-Block",
    "reason": "Library project work",
    "exitTime": "10:00 PM",
    "checkOutAt": "Dec 11, 2025, 10:05 PM",
    "validUntil": "Dec 12, 2025, 2:00 AM",
    "society": "Tech Club"
  }
}
```

**Response (Check-In):**
```json
{
  "success": true,
  "action": "check-in",
  "message": "Student returned safely to hostel",
  "student": {
    "name": "John Doe",
    "rollNo": "CS21B034",
    "hostel": "CS-Block",
    "reason": "Library project work",
    "exitTime": "10:00 PM",
    "checkOutAt": "Dec 11, 2025, 10:05 PM",
    "checkInAt": "Dec 12, 2025, 12:30 AM",
    "duration": "2h 25m",
    "society": "Tech Club"
  }
}
```

**Response (Already Used):**
```json
{
  "success": false,
  "message": "Pass already fully used (check-out and check-in completed)",
  "checkOutAt": "Dec 11, 2025, 10:05 PM",
  "checkInAt": "Dec 12, 2025, 12:30 AM"
}
```

## UI Changes

### 1. Guard Scanner (`app/guard-scanner/page.tsx`)
- **Check-Out Screen**: Green background with "EXIT AUTHORIZED" title
- **Check-In Screen**: Blue background with "WELCOME BACK" title, shows duration calculation
- **Both display**: Student details, timestamps, reason, society info

### 2. Verified Pass Screen (`components/verified-pass-screen.tsx`)
- **New instruction**: "📱 Scan this QR code TWICE: 1️⃣ When LEAVING hostel • 2️⃣ When RETURNING"
- **Clarifies**: Same QR works for both check-out and check-in

### 3. Student View (`components/views/student-view.tsx`)
- **Status Card**: Shows "Out of Hostel" (orange) when student has checked out but not checked in
- **Status Card**: Shows check-out timestamp when out
- **Default**: Shows "In Hostel" (blue) when not checked out or after check-in

## State Machine Logic

```
INITIAL STATE → Check-Out → Out of Hostel → Check-In → FINAL STATE
     ↓              ↓            ↓              ↓           ↓
checkOutAt=NULL  Set checkOutAt  checkInAt=NULL  Set checkInAt  Both set
                 Set verifiedAt                               (no more scans)
```

**Validation Rules:**
1. ✅ Cannot check-out twice (validates `checkOutAt` is NULL)
2. ✅ Cannot check-in without check-out (validates `checkOutAt` exists)
3. ✅ Cannot check-in twice (validates `checkInAt` is NULL)
4. ✅ Cannot use pass after both timestamps are set
5. ✅ Still validates expiry (`expiresAt` check)
6. ✅ Still validates approval status (must be `APPROVED`)

## Security Features

### Same QR Token for Both Actions
- **Benefit**: Single JWT token, no need to generate new QR
- **Security**: JWT still validates signature, expiry, and request ID
- **Convenience**: Student doesn't need to refresh or get new pass

### Tracking
- **Audit Trail**: Both `checkOutBy` and `checkInBy` record which guards verified
- **Time Tracking**: Exact timestamps allow calculating time out of hostel
- **Analytics**: Can track patterns, late returns, duration statistics

### Anti-Fraud
- **One-time use**: Cannot scan more than twice (once out, once in)
- **Sequential**: Must check-out before check-in (enforced by state machine)
- **Live verification**: Real-time clock on pass prevents screenshot reuse
- **Expiry check**: Pass expires at 2 AM regardless of check-in status

## Testing the Feature

### Test Scenario 1: Normal Flow
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `npm run dev`
3. Create permission request → Get faculty approval (generates QR)
4. Open student view → Show verified pass with QR code
5. Navigate to `/guard-scanner` → Scan QR code
6. **Expected**: Green "EXIT AUTHORIZED" screen with check-out time
7. Scan SAME QR code again
8. **Expected**: Blue "WELCOME BACK" screen with duration
9. Try scanning third time
10. **Expected**: Red "ACCESS DENIED" - Pass fully used

### Test Scenario 2: Validation Checks
- Try check-in without check-out → Should fail
- Try expired QR token → Should fail with "QR token expired"
- Try invalid JWT → Should fail with "Invalid QR token"

### Test Scenario 3: Student Status Display
- After check-out → Student view should show "Out of Hostel" (orange) with timestamp
- After check-in → Student view should return to "In Hostel" (blue)

## Migration Notes

### Backwards Compatibility
- Existing `verifiedAt` and `verifiedBy` fields are still populated on check-out
- Old passes (if any) will work but won't have check-in capability
- Database migration is automatic via `prisma db push`

### Production Deployment
1. Backup database before deploying
2. Run `npx prisma db push` to add new columns
3. Deploy backend with updated `/api/guard/verify-qr` endpoint
4. Deploy frontend with updated guard scanner UI
5. Test with a single permission request before full rollout

## Duration Calculation

```typescript
const duration = checkInAt.getTime() - checkOutAt.getTime()
const hours = Math.floor(duration / (1000 * 60 * 60))
const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
// Display: "2h 25m"
```

## Future Enhancements

1. **Late Return Alerts**: Notify admin if student checks in after expiry time
2. **Dashboard Analytics**: Show avg time out, late returns, check-out patterns
3. **SMS Notifications**: Send SMS when student checks out/in for parents
4. **Location Tracking**: Validate check-in happens at hostel gate (GPS)
5. **Grace Period**: Allow 15-min grace after expiry for check-in
6. **Hostel Warden View**: Real-time list of students currently out

## Summary

✅ **Database**: Added 4 new fields for check-in/check-out tracking
✅ **Backend**: State machine logic in `/api/guard/verify-qr` endpoint
✅ **Guard Scanner**: Different UI for check-out (green) vs check-in (blue)
✅ **Student View**: Shows "Out of Hostel" status with timestamp
✅ **Verified Pass**: Instructions clarify QR works for both actions
✅ **Security**: Same JWT token, one-time use per action, sequential validation
✅ **Testing**: Ready for end-to-end testing

The system is now fully implemented and ready for testing! 🎉
