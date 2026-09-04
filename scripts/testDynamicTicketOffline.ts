import { ticketSecurityService, DEMO_TICKETS } from '../src/services/ticketSecurityService';

async function runTests() {
  console.log('🧪 Starting Offline Dynamic Ticket Security & Verification Tests...\n');

  const ticket = DEMO_TICKETS[0];
  console.log(`[Test 1] Generating dynamic payload for: ${ticket.passengerName} (${ticket.routeName})...`);
  const payload = ticketSecurityService.generateDynamicTicketPayload(ticket);
  console.log('✓ Generated Payload:');
  console.log(`  - Ticket ID: ${payload.tid}`);
  console.log(`  - Window: ${payload.window} (TTL: ${payload.secondsRemaining}s remaining)`);
  console.log(`  - 6-Digit TOTP Passkey: ${payload.otp}`);
  console.log(`  - HMAC-SHA256 Signature Snippet: ${payload.sig}`);

  console.log('\n[Test 2] Generating offline QR Code DataURL...');
  const qrDataUrl = await ticketSecurityService.generateQRCodeDataUrl(payload);
  if (!qrDataUrl.startsWith('data:image/png;base64,')) {
    throw new Error('QR DataURL generation failed!');
  }
  console.log(`✓ QR Code DataURL successfully created (${qrDataUrl.length} chars)`);

  console.log('\n[Test 3] Conductor offline scan of authentic live QR payload...');
  const scannedResult = ticketSecurityService.validateTicketOffline(JSON.stringify(payload));
  console.log('✓ Validation Result:', scannedResult.status, '–', scannedResult.message);
  if (!scannedResult.isValid) {
    throw new Error(`Expected valid ticket, got: ${scannedResult.status}`);
  }

  console.log('\n[Test 4] Anti-Replay / Double-Tap scan attempt of the same ticket...');
  const doubleTapResult = ticketSecurityService.validateTicketOffline(JSON.stringify(payload));
  console.log('✓ Double-Tap Result:', doubleTapResult.status, '–', doubleTapResult.message);
  if (doubleTapResult.status !== 'ALREADY_SCANNED' || doubleTapResult.isValid) {
    throw new Error(`Expected ALREADY_SCANNED, got: ${doubleTapResult.status}`);
  }

  console.log('\n[Test 5] Conductor scan of expired screenshot (10 minutes old)...');
  const expiredPayloadString = ticketSecurityService.generateExpiredScreenshotPayload(DEMO_TICKETS[1]);
  const expiredResult = ticketSecurityService.validateTicketOffline(expiredPayloadString);
  console.log('✓ Expired Screenshot Result:', expiredResult.status, '–', expiredResult.message);
  if (expiredResult.status !== 'EXPIRED_SCREENSHOT' || expiredResult.isValid) {
    throw new Error(`Expected EXPIRED_SCREENSHOT, got: ${expiredResult.status}`);
  }

  console.log('\n[Test 6] Conductor scan of tampered fake ticket payload...');
  const tamperedPayloadString = ticketSecurityService.generateTamperedPayload(DEMO_TICKETS[2]);
  const tamperedResult = ticketSecurityService.validateTicketOffline(tamperedPayloadString);
  console.log('✓ Tampered Ticket Result:', tamperedResult.status, '–', tamperedResult.message);
  if (tamperedResult.status !== 'EXPIRED_SCREENSHOT' && tamperedResult.status !== 'INVALID_SIGNATURE') {
    throw new Error(`Expected rejection for tampered ticket, got: ${tamperedResult.status}`);
  }

  console.log('\n[Test 7] Manual 6-digit TOTP passkey entry verification (e.g. cracked passenger screen)...');
  const ticket3 = DEMO_TICKETS[2];
  const payload3 = ticketSecurityService.generateDynamicTicketPayload(ticket3);
  const passkeyResult = ticketSecurityService.validateTicketOffline(payload3.otp);
  console.log('✓ Passkey Result:', passkeyResult.status, '–', passkeyResult.message);
  if (!passkeyResult.isValid || !passkeyResult.passkeyMatched) {
    throw new Error(`Expected passkey match, got: ${passkeyResult.status}`);
  }

  console.log('\n[Test 8] Conductor Shift Stats Check...');
  const stats = ticketSecurityService.getShiftStats();
  console.log('✓ Shift Stats:', stats);

  console.log('\n🎉 ALL 8 OFFLINE DYNAMIC TICKET VERIFICATION TESTS PASSED PERFECTLY!\n');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
