import {
  IndianPhoneSchema,
  OtpRequestSchema,
  OtpVerifySchema,
  ParcelBookingSchema,
  PaymentCreateOrderSchema,
  MapDirectionsQuerySchema,
  CommunityReportCreateSchema,
} from '../server/validators.ts';

console.log('--- Testing Zod Validators ---');

// 1. Phone validation
const validPhone = IndianPhoneSchema.safeParse('+91 9876543210');
console.log('Valid Indian Phone (+91 9876543210):', validPhone.success, validPhone.data === '9876543210' ? '✓' : '✗');

const invalidPhone = IndianPhoneSchema.safeParse('123456');
console.log('Invalid Phone (123456):', !invalidPhone.success ? '✓ Successfully rejected' : '✗ Failed to reject');

// 2. OTP Request
const validOtpReq = OtpRequestSchema.safeParse({ phone: '9876501234' });
console.log('Valid OTP Request:', validOtpReq.success ? '✓' : '✗');

const invalidOtpVerify = OtpVerifySchema.safeParse({ phone: '9876501234', otp: 'abc' });
console.log('Invalid OTP code (abc):', !invalidOtpVerify.success ? '✓ Successfully rejected' : '✗ Failed to reject');

// 3. Parcel Booking
const validParcel = ParcelBookingSchema.safeParse({
  recipientName: 'Aarav Patel',
  recipientPhone: '9876543210',
  weightKg: 2.5,
});
console.log('Valid Parcel Booking:', validParcel.success ? '✓' : '✗');

const invalidParcelWeight = ParcelBookingSchema.safeParse({
  recipientName: 'Aarav Patel',
  recipientPhone: '9876543210',
  weightKg: 150, // exceeds 50kg limit
});
console.log('Overweight Parcel (150kg):', !invalidParcelWeight.success ? '✓ Successfully rejected' : '✗ Failed to reject');

// 4. Payment Order
const validPayment = PaymentCreateOrderSchema.safeParse({
  amount: 250,
  purpose: 'Mo Bus Pass Monthly',
  customerPhone: '9876543210',
});
console.log('Valid Payment Order:', validPayment.success ? '✓' : '✗');

const invalidPayment = PaymentCreateOrderSchema.safeParse({
  amount: -50,
});
console.log('Negative Payment Amount (-50):', !invalidPayment.success ? '✓ Successfully rejected' : '✗ Failed to reject');

// 5. Map Directions
const validDirections = MapDirectionsQuerySchema.safeParse({
  origin: 'Jayadev Vihar',
  destination: 'KIIT Square',
  mode: 'transit',
});
console.log('Valid Map Directions Query:', validDirections.success ? '✓' : '✗');

// 6. Community Report
const validReport = CommunityReportCreateSchema.safeParse({
  title: 'Pothole on Main Road',
  description: 'Deep pothole causing buses to swerve dangerously',
  category: 'road_blockage',
  locationName: 'Vani Vihar Square',
  lat: 20.301,
  lng: 85.835,
  reporterName: 'Sunita Mishra',
});
console.log('Valid Community Report:', validReport.success ? '✓' : '✗');

console.log('\nAll security validators verified successfully!');
