import React, { useState, useEffect } from 'react';
import { 
  X, ShieldCheck, QrCode, Smartphone, CreditCard, ArrowRight, CheckCircle2, 
  Copy, Check, RefreshCw, Lock, Sparkles, AlertCircle, ExternalLink, Download,
  Wallet, FileText, ChevronRight
} from 'lucide-react';
import { paymentService, PaymentOrderResponse, PaymentVerificationResult } from '../../services/paymentService';

export type PaymentMethodTab = 'upi_apps' | 'bharat_qr' | 'razorpay_cards';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  purpose: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  onPaymentSuccess: (result: PaymentVerificationResult) => void;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  amount,
  purpose,
  customerName = 'Traveller',
  customerPhone = '',
  customerEmail = '',
  onPaymentSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<PaymentMethodTab>('upi_apps');
  const [order, setOrder] = useState<PaymentOrderResponse | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopiedVpa, setIsCopiedVpa] = useState(false);
  const [timeLeftSec, setTimeLeftSec] = useState(300); // 5 min countdown
  const [successResult, setSuccessResult] = useState<PaymentVerificationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize or fetch order details on open
  useEffect(() => {
    if (isOpen && amount > 0) {
      setIsLoadingOrder(true);
      setSuccessResult(null);
      setErrorMessage(null);
      setTimeLeftSec(300);

      paymentService.createOrder({
        amount,
        purpose,
        customerName,
        customerPhone,
        customerEmail,
      }).then((orderData) => {
        setOrder(orderData);
        setIsLoadingOrder(false);
      }).catch(() => {
        setIsLoadingOrder(false);
      });
    }
  }, [isOpen, amount, purpose]);

  // Countdown timer for dynamic QR expiration
  useEffect(() => {
    if (!isOpen || successResult || timeLeftSec <= 0) return;
    const interval = setInterval(() => {
      setTimeLeftSec((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, successResult, timeLeftSec]);

  if (!isOpen) return null;

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCopyVpa = () => {
    if (order?.upiVpa) {
      navigator.clipboard.writeText(order.upiVpa);
      setIsCopiedVpa(true);
      setTimeout(() => setIsCopiedVpa(false), 2000);
    }
  };

  // Launch Razorpay Standard Gateway Modal
  const handleLaunchRazorpay = () => {
    if (!order) return;
    setIsProcessing(true);
    setErrorMessage(null);

    paymentService.openRazorpay(
      order,
      { name: customerName, phone: customerPhone, email: customerEmail },
      (result) => {
        setIsProcessing(false);
        setSuccessResult(result);
        onPaymentSuccess(result);
      },
      (err) => {
        setIsProcessing(false);
        if (!err.includes('cancelled')) {
          setErrorMessage(err);
        }
      }
    );
  };

  // Trigger UPI deep link directly for mobile apps
  const handleLaunchUpiApp = (appName: string, schemePrefix?: string) => {
    if (!order) return;
    setIsProcessing(true);
    setErrorMessage(null);

    let finalUri = order.upiUri;
    if (schemePrefix) {
      // E.g. phonepe://pay?..., paytmmp://pay?...
      finalUri = order.upiUri.replace('upi://pay', `${schemePrefix}://pay`);
    }

    // Attempt direct native app invocation
    window.location.href = finalUri;

    // Simulate verification check after user returns to app
    setTimeout(async () => {
      const verifyResult = await paymentService.verifyPayment({
        amount: order.amount,
        purpose: order.purpose,
        method: `Direct UPI (${appName})`,
        customerPhone,
        customerName,
        txnRef: order.txnRef,
      });
      setIsProcessing(false);
      setSuccessResult(verifyResult);
      onPaymentSuccess(verifyResult);
    }, 2500);
  };

  // Verify manual QR code payment completion
  const handleConfirmQrPaid = async () => {
    if (!order) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const verifyResult = await paymentService.verifyPayment({
        amount: order.amount,
        purpose: order.purpose,
        method: 'Bharat Dynamic QR Scanner',
        customerPhone,
        customerName,
        txnRef: order.txnRef,
      });
      setIsProcessing(false);
      setSuccessResult(verifyResult);
      onPaymentSuccess(verifyResult);
    } catch (e: any) {
      setIsProcessing(false);
      setErrorMessage('Could not verify QR settlement. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-[12000] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white p-0.5 shadow-sm flex items-center justify-center flex-shrink-0">
              <img src="/musafir-logo.png" alt="Musafir" className="w-full h-full object-contain rounded-xl" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-base tracking-tight uppercase">Musafir Pay</h3>
                <span className="bg-emerald-400/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Secure Gateway
                </span>
              </div>
              <p className="text-xs text-blue-100 font-medium">NPCI & Razorpay 256-Bit SSL Encrypted</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
            title="Cancel Payment"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success View */}
        {successResult ? (
          <div className="p-6 sm:p-8 flex flex-col items-center text-center space-y-5 overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center animate-bounce shadow-lg shadow-emerald-600/20">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>
            
            <div>
              <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">Payment Successful!</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Your transaction has been confirmed and settled instantly.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-left space-y-2.5 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 font-medium">Amount Paid:</span>
                <span className="font-extrabold text-base text-emerald-600 dark:text-emerald-400">₹{successResult.amount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Receipt No:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{successResult.receiptNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Payment ID:</span>
                <span className="font-mono text-slate-600 dark:text-slate-400 truncate max-w-[180px]">{successResult.paymentId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Purpose:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{successResult.purpose}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Payment Method:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">{successResult.method}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold text-sm shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Done & Return to App</span>
            </button>
          </div>
        ) : (
          /* Payment Selection Form */
          <div className="p-4 sm:p-6 flex flex-col flex-1 overflow-y-auto space-y-4">
            
            {/* Amount Banner */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/80 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800/60 rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">Total Payable Amount</span>
                <strong className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">₹{amount.toFixed(2)}</strong>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[240px] mt-0.5">{purpose}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400">Order Ref</span>
                <span className="font-mono text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                  {order ? order.txnRef.slice(-8) : 'MSFR...'}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Zero Surcharge
                </span>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Payment Method Switcher Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setActiveTab('upi_apps')}
                className={`py-2 px-1 rounded-xl text-xs font-extrabold flex flex-col sm:flex-row items-center justify-center gap-1 transition ${
                  activeTab === 'upi_apps'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>UPI Apps</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('bharat_qr')}
                className={`py-2 px-1 rounded-xl text-xs font-extrabold flex flex-col sm:flex-row items-center justify-center gap-1 transition ${
                  activeTab === 'bharat_qr'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Bharat QR</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('razorpay_cards')}
                className={`py-2 px-1 rounded-xl text-xs font-extrabold flex flex-col sm:flex-row items-center justify-center gap-1 transition ${
                  activeTab === 'razorpay_cards'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Razorpay / Cards</span>
              </button>
            </div>

            {/* TAB 1: Instant UPI Apps */}
            {activeTab === 'upi_apps' && (
              <div className="space-y-3 pt-1">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Tap to Pay via Installed App (1-Click)
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* Google Pay */}
                  <button
                    type="button"
                    onClick={() => handleLaunchUpiApp('Google Pay')}
                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-blue-500 hover:shadow-md transition flex items-center gap-3 text-left group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-slate-700 flex items-center justify-center font-bold text-sm text-blue-600">
                      GPay
                    </div>
                    <div>
                      <strong className="text-xs text-slate-800 dark:text-slate-200 block group-hover:text-blue-600">Google Pay</strong>
                      <span className="text-[10px] text-slate-400">Instant UPI</span>
                    </div>
                  </button>

                  {/* PhonePe */}
                  <button
                    type="button"
                    onClick={() => handleLaunchUpiApp('PhonePe', 'phonepe')}
                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-purple-500 hover:shadow-md transition flex items-center gap-3 text-left group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center font-bold text-sm text-purple-600">
                      Pe
                    </div>
                    <div>
                      <strong className="text-xs text-slate-800 dark:text-slate-200 block group-hover:text-purple-600">PhonePe</strong>
                      <span className="text-[10px] text-slate-400">Direct App</span>
                    </div>
                  </button>

                  {/* Paytm */}
                  <button
                    type="button"
                    onClick={() => handleLaunchUpiApp('Paytm', 'paytmmp')}
                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-cyan-500 hover:shadow-md transition flex items-center gap-3 text-left group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 flex items-center justify-center font-bold text-sm text-cyan-600">
                      Paytm
                    </div>
                    <div>
                      <strong className="text-xs text-slate-800 dark:text-slate-200 block group-hover:text-cyan-600">Paytm UPI</strong>
                      <span className="text-[10px] text-slate-400">UPI FastPay</span>
                    </div>
                  </button>

                  {/* BHIM / CRED / Any UPI */}
                  <button
                    type="button"
                    onClick={() => handleLaunchUpiApp('BHIM / Other UPI')}
                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-emerald-500 hover:shadow-md transition flex items-center gap-3 text-left group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center font-bold text-sm text-emerald-600">
                      UPI
                    </div>
                    <div>
                      <strong className="text-xs text-slate-800 dark:text-slate-200 block group-hover:text-emerald-600">BHIM / CRED</strong>
                      <span className="text-[10px] text-slate-400">All UPI Apps</span>
                    </div>
                  </button>
                </div>

                {/* Copy VPA Option */}
                <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 font-semibold block">Merchant UPI ID</span>
                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 truncate block">
                      {order?.upiVpa || 'musafirtransit@upi'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyVpa}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 transition flex items-center gap-1.5 shadow-sm"
                  >
                    {isCopiedVpa ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopiedVpa ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: Dynamic Bharat QR Scanner */}
            {activeTab === 'bharat_qr' && (
              <div className="flex flex-col items-center text-center space-y-3 pt-1">
                <div className="flex items-center justify-between w-full text-xs font-bold px-1">
                  <span className="text-slate-500">Scan with any Indian UPI App</span>
                  <span className="text-rose-600 dark:text-rose-400 font-mono bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-lg border border-rose-200 dark:border-rose-800">
                    Expires in {formatTimer(timeLeftSec)}
                  </span>
                </div>

                {/* QR Canvas Container */}
                <div className="p-3 bg-white rounded-3xl border-2 border-dashed border-blue-300 dark:border-blue-800 shadow-lg relative flex items-center justify-center">
                  {order ? (
                    <img
                      src={paymentService.getUpiQrImageUrl(order.upiUri, 220)}
                      alt="UPI QR Code"
                      className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-xl"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 pointer-events-none rounded-3xl border-2 border-blue-500/30" />
                </div>

                <p className="text-[11px] text-slate-400 max-w-xs">
                  Open Google Pay, PhonePe, Paytm, BHIM, Amazon Pay or any banking app and point camera to pay ₹{amount}.
                </p>

                <button
                  type="button"
                  onClick={handleConfirmQrPaid}
                  disabled={isProcessing}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isProcessing ? 'Verifying Transaction...' : 'I Have Completed Payment'}</span>
                </button>
              </div>
            )}

            {/* TAB 3: Razorpay Cards & NetBanking */}
            {activeTab === 'razorpay_cards' && (
              <div className="space-y-4 pt-1">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                      💳
                    </div>
                    <div>
                      <strong className="text-xs text-slate-900 dark:text-white block">Credit / Debit Cards & NetBanking</strong>
                      <span className="text-[10px] text-slate-400">Visa, Mastercard, RuPay, Maestro & 50+ Banks</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <p>• Supports HDFC, ICICI, SBI, Axis, Kotak & all major banks</p>
                    <p>• Supports Mobikwik, Freecharge, Airtel Money, PayLater</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLaunchRazorpay}
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:opacity-95 active:scale-[0.99] text-white font-extrabold text-sm shadow-xl shadow-blue-600/30 transition flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isProcessing ? 'Opening Gateway...' : `Proceed with Razorpay (₹${amount.toFixed(2)})`}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            )}

            {/* Security Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>PCI-DSS Level 1 Compliant</span>
              </span>
              <span>100% Safe & Instant Settlement</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
