import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// ── Indian Mobile Number Validator ─────────────────────────────────────────
// Accepts 10-digit formats with optional +91 or 91 country code prefix
export const IndianPhoneSchema = z
  .string()
  .transform(val => val.replace(/\D/g, ''))
  .refine(digits => {
    const clean = digits.length > 10 ? digits.slice(-10) : digits;
    return clean.length === 10 && /^[6-9]\d{9}$/.test(clean);
  }, {
    message: 'Invalid Indian mobile number. Must be a valid 10-digit number starting with 6, 7, 8, or 9.',
  })
  .transform(digits => (digits.length > 10 ? digits.slice(-10) : digits));

// ── Auth & OTP Schemas ─────────────────────────────────────────────────────
export const OtpRequestSchema = z.object({
  phone: IndianPhoneSchema,
});

export const OtpVerifySchema = z.object({
  phone: IndianPhoneSchema,
  otp: z
    .string()
    .trim()
    .regex(/^\d{4,6}$/, 'OTP code must be 4 to 6 numeric digits'),
});

export const LoginNotificationSchema = z.object({
  email: z.string().trim().email('Valid email address required'),
  fullName: z.string().optional().default('Passenger'),
  phone: z.string().optional(),
  category: z.string().optional(),
  homeCity: z.string().optional(),
});

// ── User Profiles Schema ───────────────────────────────────────────────────
export const UserProfileSchema = z.object({
  email: z.string().trim().email('A valid email address is required'),
  fullName: z.string().trim().min(2, 'Full name must have at least 2 characters'),
  phone: z.string().optional(),
  bloodGroup: z.string().optional(),
  homeCity: z.string().optional(),
  category: z.string().optional(),
  studentCollege: z.string().optional(),
  studentRoll: z.string().optional(),
  emergencyContact: z.string().optional(),
});

// ── Transit & Trips Schemas ────────────────────────────────────────────────
export const TripCreateSchema = z.object({
  origin: z.string().min(2, 'Origin location required'),
  destination: z.string().min(2, 'Destination location required'),
  originCoords: z.array(z.number()).length(2).optional(),
  destCoords: z.array(z.number()).length(2).optional(),
  distanceKm: z.coerce.number().optional(),
  durationMins: z.coerce.number().optional(),
  fareAmount: z.coerce.number().optional(),
  fare: z.coerce.number().optional(),
  mode: z.string().optional(),
  routeName: z.string().optional(),
  vehicleType: z.string().optional(),
  userId: z.string().optional(),
  passengerCount: z.coerce.number().int().positive().optional().default(1),
});

export const RefundClaimSchema = z.object({
  tripId: z.string().min(2, 'Trip ID is required for refund claim'),
  reason: z.string().optional(),
  delayMinutes: z.coerce.number().optional().default(20),
  farePaid: z.coerce.number().optional().default(35),
});

// ── Parcels & Logistics Schemas ────────────────────────────────────────────
export const ParcelBookingSchema = z.object({
  senderName: z.string().optional(),
  senderPhone: z.string().optional(),
  recipientName: z.string().trim().min(2, 'Recipient name is required'),
  recipientPhone: IndianPhoneSchema,
  originStation: z.string().optional(),
  destStation: z.string().optional(),
  weightKg: z.coerce.number().min(0.05, 'Minimum package weight is 0.05 kg').max(50, 'Maximum transit locker package weight is 50 kg').optional().default(1.5),
  fare: z.coerce.number().min(0).optional().default(35),
});

export const ParcelUnlockSchema = z.object({
  parcelId: z.string().min(2, 'Parcel identifier is required'),
  pin: z.string().trim().min(3, 'Security PIN required').max(8),
});

export const ParcelMishapSchema = z.object({
  trackingCode: z.string().trim().min(3, 'Tracking code is required'),
  issueType: z.string().trim().min(3, 'Issue category is required'),
  description: z.string().trim().min(5, 'Please provide description of the damage or delay'),
  photoProof: z.string().optional(),
  location: z.string().optional(),
});

// ── Wallet & Payments Schemas ──────────────────────────────────────────────
export const WalletTopupSchema = z.object({
  amount: z.coerce.number().positive('Top-up amount must be positive').max(10000, 'UPI single top-up limit is ₹10,000'),
  method: z.string().optional(),
});

export const PaymentCreateOrderSchema = z.object({
  amount: z.coerce.number().positive('Payment amount must be greater than 0').max(50000, 'Single transaction limit is ₹50,000'),
  currency: z.string().optional().default('INR'),
  purpose: z.string().optional().default('Transit Payment'),
  customerPhone: z.string().optional(),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional().or(z.literal('')),
});

export const PaymentVerifySchema = z.object({
  razorpay_order_id: z.string().optional(),
  razorpay_payment_id: z.string().optional(),
  razorpay_signature: z.string().optional(),
  method: z.string().optional().default('razorpay'),
  amount: z.coerce.number().optional(),
  purpose: z.string().optional(),
  customerPhone: z.string().optional(),
  customerName: z.string().optional(),
  txnRef: z.string().optional(),
});

// ── Google Maps Proxy Schemas ──────────────────────────────────────────────
export const MapDirectionsQuerySchema = z.object({
  origin: z.string().trim().min(2, 'Origin query is required'),
  destination: z.string().trim().min(2, 'Destination query is required'),
  mode: z.enum(['transit', 'driving', 'walking', 'bicycling']).optional().default('transit'),
});

export const MapAutocompleteQuerySchema = z.object({
  input: z.string().trim().max(250).optional().default(''),
});

export const MapGeocodeQuerySchema = z.object({
  address: z.string().trim().min(2, 'Address query required').max(350),
});

export const MapNearbyQuerySchema = z.object({
  location: z.string().trim().min(3, 'Coordinates (lat,lng) required'),
  radius: z.string().optional().default('2000'),
  type: z.string().optional().default('transit_station'),
});

// ── Community Reports Schema ───────────────────────────────────────────────
export const CommunityReportCreateSchema = z.object({
  title: z.string().trim().min(3, 'Title must have at least 3 characters').max(200),
  description: z.string().trim().min(5, 'Description must have at least 5 characters'),
  category: z.enum([
    'overcrowding',
    'road_blockage',
    'poor_lighting',
    'waterlogging',
    'bus_delayed_cancelled',
    'damaged_shelter',
    'safety_concern',
  ]),
  locationName: z.string().trim().min(2, 'Location name is required'),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  reporterName: z.string().trim().min(2, 'Reporter name required'),
  reporterId: z.string().optional(),
  severity: z.enum(['low', 'moderate', 'critical', 'emergency']).optional().default('moderate'),
  photoUrl: z.string().optional(),
  evidenceUrls: z.array(z.string()).optional(),
  isEmergency: z.boolean().optional().default(false),
});

// ── Express Validation Middlewares ─────────────────────────────────────────
export function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const formattedErrors = result.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: formattedErrors,
      });
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const formattedErrors = result.error.issues.map(issue => ({
        param: issue.path.join('.'),
        message: issue.message,
      }));
      return res.status(400).json({
        success: false,
        error: 'Query Parameter Validation Error',
        details: formattedErrors,
      });
    }
    req.query = result.data as any;
    next();
  };
}
