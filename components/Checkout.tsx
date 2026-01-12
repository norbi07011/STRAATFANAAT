import React, { useState } from 'react';
import { 
  CreditCard, Lock, ShoppingBag, Truck, ChevronRight, Check, 
  AlertCircle, Loader2, ArrowLeft, MapPin, User, Mail, Phone,
  Building, Hash, Globe
} from 'lucide-react';
import { Language, CartItem } from '../types';
import { TRANSLATIONS } from '../constants';
import { supabase } from '../lib/supabase';

interface CheckoutProps {
  lang: Language;
  cart: CartItem[];
  onBack: () => void;
  onSuccess: (orderNumber: string) => void;
  clearCart: () => void;
}

type CheckoutStep = 'info' | 'shipping' | 'payment' | 'confirmation';

interface CustomerInfo {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface ShippingAddress {
  street: string;
  apartment: string;
  city: string;
  postalCode: string;
  country: string;
}

interface PaymentInfo {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
}

const SHIPPING_COST = 5.95;
const FREE_SHIPPING_THRESHOLD = 75;

export const Checkout: React.FC<CheckoutProps> = ({ lang, cart, onBack, onSuccess, clearCart }) => {
  const t = TRANSLATIONS[lang];
  
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('info');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    email: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    street: '',
    apartment: '',
    city: '',
    postalCode: '',
    country: 'NL'
  });
  
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  const [orderNumber, setOrderNumber] = useState<string>('');

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;

  const steps: { id: CheckoutStep; label: string; icon: React.ReactNode }[] = [
    { id: 'info', label: 'Dane', icon: <User className="w-4 h-4" /> },
    { id: 'shipping', label: 'Wysyłka', icon: <Truck className="w-4 h-4" /> },
    { id: 'payment', label: 'Płatność', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'confirmation', label: 'Potwierdzenie', icon: <Check className="w-4 h-4" /> },
  ];

  const validateStep = (step: CheckoutStep): boolean => {
    setError(null);
    
    if (step === 'info') {
      if (!customerInfo.email || !customerInfo.firstName || !customerInfo.lastName) {
        setError('Wypełnij wszystkie wymagane pola');
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
        setError('Podaj prawidłowy adres email');
        return false;
      }
    }
    
    if (step === 'shipping') {
      if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.postalCode) {
        setError('Wypełnij wszystkie wymagane pola adresu');
        return false;
      }
    }
    
    if (step === 'payment') {
      if (!paymentInfo.cardNumber || !paymentInfo.cardName || !paymentInfo.expiryDate || !paymentInfo.cvv) {
        setError('Wypełnij wszystkie dane karty');
        return false;
      }
      if (paymentInfo.cardNumber.replace(/\s/g, '').length !== 16) {
        setError('Numer karty musi mieć 16 cyfr');
        return false;
      }
    }
    
    return true;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;
    
    const stepOrder: CheckoutStep[] = ['info', 'shipping', 'payment', 'confirmation'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const stepOrder: CheckoutStep[] = ['info', 'shipping', 'payment', 'confirmation'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    } else {
      onBack();
    }
  };

  const processPayment = async () => {
    if (!validateStep('payment')) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      // 1. Utwórz lub znajdź klienta
      let customerId: string;
      
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', customerInfo.email)
        .single();

      if (existingCustomer) {
        customerId = existingCustomer.id;
        
        // Aktualizuj dane klienta
        await supabase
          .from('customers')
          .update({
            first_name: customerInfo.firstName,
            last_name: customerInfo.lastName,
            phone: customerInfo.phone,
            preferred_language: lang
          })
          .eq('id', customerId);
      } else {
        // Utwórz nowego klienta
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert({
            email: customerInfo.email,
            first_name: customerInfo.firstName,
            last_name: customerInfo.lastName,
            phone: customerInfo.phone,
            preferred_language: lang
          })
          .select('id')
          .single();

        if (customerError) throw customerError;
        customerId = newCustomer.id;
      }

      // 2. Utwórz/zaktualizuj adres
      const { data: address, error: addressError } = await supabase
        .from('addresses')
        .insert({
          customer_id: customerId,
          address_type: 'shipping',
          first_name: customerInfo.firstName,
          last_name: customerInfo.lastName,
          address_line1: shippingAddress.street,
          address_line2: shippingAddress.apartment || null,
          city: shippingAddress.city,
          postal_code: shippingAddress.postalCode,
          country_code: shippingAddress.country,
          is_default: true
        })
        .select('id')
        .single();

      if (addressError) throw addressError;

      // 3. Utwórz zamówienie
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: customerId,
          customer_email: customerInfo.email,
          customer_first_name: customerInfo.firstName,
          customer_last_name: customerInfo.lastName,
          customer_phone: customerInfo.phone,
          shipping_address_id: address.id,
          billing_address_id: address.id,
          subtotal: subtotal,
          shipping_cost: shipping,
          tax_amount: 0,
          discount_amount: 0,
          grand_total: total,
          currency: 'EUR',
          status: 'pending',
          payment_status: 'pending',
          fulfillment_status: 'unfulfilled',
          shipping_method: shipping === 0 ? 'free_shipping' : 'standard',
          notes: `Język: ${lang}`
        })
        .select('id, order_number')
        .single();

      if (orderError) throw orderError;

      // 4. Dodaj pozycje zamówienia
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: null, // Można połączyć z produktem z bazy
        product_name: item.name,
        product_sku: `SKU-${item.id}`,
        variant_info: { size: item.selectedSize, color: item.colors?.[0] },
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 5. Symuluj płatność (w produkcji tutaj byłaby integracja z Stripe/PayPal)
      await new Promise(resolve => setTimeout(resolve, 1500)); // Symulacja

      // 6. Utwórz rekord płatności
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_id: order.id,
          amount: total,
          currency: 'EUR',
          provider: 'stripe',
          payment_method: 'card',
          status: 'succeeded',
          external_id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          card_brand: getCardBrand(paymentInfo.cardNumber),
          card_last4: paymentInfo.cardNumber.slice(-4),
          metadata: {
            customer_email: customerInfo.email,
            order_number: order.order_number
          }
        });

      if (paymentError) throw paymentError;

      // 7. Zaktualizuj status zamówienia
      await supabase
        .from('orders')
        .update({
          status: 'confirmed',
          payment_status: 'paid'
        })
        .eq('id', order.id);

      // 8. Zaktualizuj statystyki klienta
      await supabase
        .from('customers')
        .update({
          total_orders: (existingCustomer ? 1 : 0) + 1,
          total_spent: total
        })
        .eq('id', customerId);

      // Sukces!
      setOrderNumber(order.order_number);
      setCurrentStep('confirmation');
      clearCart();

    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Wystąpił błąd podczas przetwarzania płatności');
    } finally {
      setIsProcessing(false);
    }
  };

  const getCardBrand = (cardNumber: string): string => {
    const number = cardNumber.replace(/\s/g, '');
    if (/^4/.test(number)) return 'visa';
    if (/^5[1-5]/.test(number)) return 'mastercard';
    if (/^3[47]/.test(number)) return 'amex';
    return 'unknown';
  };

  const formatCardNumber = (value: string): string => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiryDate = (value: string): string => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={handleBack}
            className="p-2 hover:bg-zinc-900 transition-colors"
            disabled={isProcessing}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter">
            {currentStep === 'confirmation' ? 'ZAMÓWIENIE ZŁOŻONE' : 'CHECKOUT'}
          </h1>
        </div>

        {/* Progress Steps */}
        {currentStep !== 'confirmation' && (
          <div className="flex items-center justify-center gap-2 md:gap-4 mb-12">
            {steps.slice(0, -1).map((step, index) => (
              <React.Fragment key={step.id}>
                <div 
                  className={`flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 transition-all ${
                    step.id === currentStep 
                      ? 'bg-gradient-street text-black' 
                      : steps.findIndex(s => s.id === currentStep) > index
                        ? 'bg-[#adff2f] text-black'
                        : 'bg-zinc-900 text-zinc-500'
                  }`}
                >
                  {steps.findIndex(s => s.id === currentStep) > index ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.icon
                  )}
                  <span className="hidden md:inline text-xs font-black uppercase">{step.label}</span>
                </div>
                {index < steps.length - 2 && (
                  <ChevronRight className="w-4 h-4 text-zinc-600" />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500 flex items-center gap-3 text-red-500">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-bold">{error}</span>
              </div>
            )}

            {/* Customer Info Step */}
            {currentStep === 'info' && (
              <div className="bg-zinc-950 border border-zinc-900 p-6 md:p-8 space-y-6">
                <h2 className="text-xl font-black italic uppercase flex items-center gap-3">
                  <User className="w-5 h-5 text-[#00f2ff]" />
                  Dane Kontaktowe
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">
                      <Mail className="w-3 h-3 inline mr-1" /> Email *
                    </label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      className="w-full bg-black border border-zinc-800 px-4 py-3 text-sm font-bold outline-none focus:border-[#00f2ff] transition-colors"
                      placeholder="twoj@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Imię *</label>
                    <input
                      type="text"
                      value={customerInfo.firstName}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, firstName: e.target.value })}
                      className="w-full bg-black border border-zinc-800 px-4 py-3 text-sm font-bold outline-none focus:border-[#00f2ff] transition-colors"
                      placeholder="Jan"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Nazwisko *</label>
                    <input
                      type="text"
                      value={customerInfo.lastName}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, lastName: e.target.value })}
                      className="w-full bg-black border border-zinc-800 px-4 py-3 text-sm font-bold outline-none focus:border-[#00f2ff] transition-colors"
                      placeholder="Kowalski"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">
                      <Phone className="w-3 h-3 inline mr-1" /> Telefon
                    </label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      className="w-full bg-black border border-zinc-800 px-4 py-3 text-sm font-bold outline-none focus:border-[#00f2ff] transition-colors"
                      placeholder="+48 123 456 789"
                    />
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  className="w-full py-4 bg-gradient-street text-black font-black italic uppercase text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                >
                  Dalej <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Shipping Step */}
            {currentStep === 'shipping' && (
              <div className="bg-zinc-950 border border-zinc-900 p-6 md:p-8 space-y-6">
                <h2 className="text-xl font-black italic uppercase flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-[#00f2ff]" />
                  Adres Dostawy
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Ulica i numer *</label>
                    <input
                      type="text"
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                      className="w-full bg-black border border-zinc-800 px-4 py-3 text-sm font-bold outline-none focus:border-[#00f2ff] transition-colors"
                      placeholder="ul. Przykładowa 123"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Mieszkanie / Lokal</label>
                    <input
                      type="text"
                      value={shippingAddress.apartment}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, apartment: e.target.value })}
                      className="w-full bg-black border border-zinc-800 px-4 py-3 text-sm font-bold outline-none focus:border-[#00f2ff] transition-colors"
                      placeholder="m. 45"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Miasto *</label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      className="w-full bg-black border border-zinc-800 px-4 py-3 text-sm font-bold outline-none focus:border-[#00f2ff] transition-colors"
                      placeholder="Warszawa"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Kod pocztowy *</label>
                    <input
                      type="text"
                      value={shippingAddress.postalCode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                      className="w-full bg-black border border-zinc-800 px-4 py-3 text-sm font-bold outline-none focus:border-[#00f2ff] transition-colors"
                      placeholder="00-001"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">
                      <Globe className="w-3 h-3 inline mr-1" /> Kraj *
                    </label>
                    <select
                      value={shippingAddress.country}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                      className="w-full bg-black border border-zinc-800 px-4 py-3 text-sm font-bold outline-none focus:border-[#00f2ff] transition-colors"
                    >
                      <option value="NL">Holandia</option>
                      <option value="PL">Polska</option>
                      <option value="DE">Niemcy</option>
                      <option value="BE">Belgia</option>
                      <option value="FR">Francja</option>
                      <option value="UK">Wielka Brytania</option>
                    </select>
                  </div>
                </div>

                {/* Shipping Options */}
                <div className="space-y-3">
                  <h3 className="text-sm font-black uppercase text-zinc-400">Metoda Dostawy</h3>
                  <div className={`p-4 border ${subtotal >= FREE_SHIPPING_THRESHOLD ? 'border-[#adff2f] bg-[#adff2f]/10' : 'border-zinc-800'} flex justify-between items-center`}>
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5" />
                      <div>
                        <p className="font-bold text-sm">Standardowa Wysyłka</p>
                        <p className="text-xs text-zinc-500">3-5 dni roboczych</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                        <span className="text-[#adff2f] font-black">GRATIS</span>
                      ) : (
                        <span className="font-mono font-bold">€{SHIPPING_COST}</span>
                      )}
                    </div>
                  </div>
                  {subtotal < FREE_SHIPPING_THRESHOLD && (
                    <p className="text-xs text-zinc-500 text-center">
                      Dodaj jeszcze €{(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2)} do darmowej wysyłki!
                    </p>
                  )}
                </div>

                <button
                  onClick={handleNext}
                  className="w-full py-4 bg-gradient-street text-black font-black italic uppercase text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                >
                  Dalej do płatności <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Payment Step */}
            {currentStep === 'payment' && (
              <div className="bg-zinc-950 border border-zinc-900 p-6 md:p-8 space-y-6">
                <h2 className="text-xl font-black italic uppercase flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-[#00f2ff]" />
                  Płatność Kartą
                </h2>

                <div className="flex items-center gap-2 p-3 bg-zinc-900/50 border border-zinc-800">
                  <Lock className="w-4 h-4 text-[#adff2f]" />
                  <span className="text-xs text-zinc-400">Twoje dane są bezpieczne i szyfrowane</span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Numer karty *</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={paymentInfo.cardNumber}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: formatCardNumber(e.target.value) })}
                        maxLength={19}
                        className="w-full bg-black border border-zinc-800 px-4 py-3 text-sm font-mono font-bold outline-none focus:border-[#00f2ff] transition-colors"
                        placeholder="1234 5678 9012 3456"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                        <div className="w-8 h-5 bg-gradient-to-r from-blue-600 to-blue-800 rounded text-[6px] text-white font-bold flex items-center justify-center">VISA</div>
                        <div className="w-8 h-5 bg-gradient-to-r from-red-500 to-yellow-500 rounded text-[6px] text-white font-bold flex items-center justify-center">MC</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Imię i nazwisko na karcie *</label>
                    <input
                      type="text"
                      value={paymentInfo.cardName}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, cardName: e.target.value.toUpperCase() })}
                      className="w-full bg-black border border-zinc-800 px-4 py-3 text-sm font-bold outline-none focus:border-[#00f2ff] transition-colors uppercase"
                      placeholder="JAN KOWALSKI"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Data ważności *</label>
                      <input
                        type="text"
                        value={paymentInfo.expiryDate}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, expiryDate: formatExpiryDate(e.target.value) })}
                        maxLength={5}
                        className="w-full bg-black border border-zinc-800 px-4 py-3 text-sm font-mono font-bold outline-none focus:border-[#00f2ff] transition-colors"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">CVV *</label>
                      <input
                        type="password"
                        value={paymentInfo.cvv}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                        maxLength={4}
                        className="w-full bg-black border border-zinc-800 px-4 py-3 text-sm font-mono font-bold outline-none focus:border-[#00f2ff] transition-colors"
                        placeholder="•••"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={processPayment}
                  disabled={isProcessing}
                  className="w-full py-4 bg-gradient-street text-black font-black italic uppercase text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Przetwarzanie...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Zapłać €{total.toFixed(2)}
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Confirmation Step */}
            {currentStep === 'confirmation' && (
              <div className="bg-zinc-950 border border-zinc-900 p-8 md:p-12 text-center space-y-6">
                <div className="w-20 h-20 mx-auto bg-[#adff2f] rounded-full flex items-center justify-center animate-bounce">
                  <Check className="w-10 h-10 text-black" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-3xl md:text-4xl font-black italic uppercase">
                    DZIĘKUJEMY!
                  </h2>
                  <p className="text-zinc-400">Twoje zamówienie zostało przyjęte</p>
                </div>

                <div className="bg-black border border-zinc-800 p-6 inline-block">
                  <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Numer zamówienia</p>
                  <p className="text-2xl font-mono font-black text-[#00f2ff]">{orderNumber}</p>
                </div>

                <div className="text-sm text-zinc-500 space-y-2">
                  <p>Potwierdzenie zostało wysłane na: <span className="text-white font-bold">{customerInfo.email}</span></p>
                  <p>Możesz śledzić status zamówienia w panelu klienta.</p>
                </div>

                <button
                  onClick={() => onSuccess(orderNumber)}
                  className="px-8 py-4 bg-gradient-street text-black font-black italic uppercase text-sm hover:scale-105 transition-transform"
                >
                  Kontynuuj Zakupy
                </button>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          {currentStep !== 'confirmation' && (
            <div className="lg:col-span-1">
              <div className="bg-zinc-950 border border-zinc-900 p-6 sticky top-32">
                <h3 className="text-lg font-black italic uppercase mb-6 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Podsumowanie
                </h3>

                <div className="space-y-4 mb-6">
                  {cart.map(item => (
                    <div key={`${item.id}-${item.selectedSize}`} className="flex gap-3">
                      <div className="relative">
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover" />
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#00f2ff] text-black text-[10px] font-black flex items-center justify-center rounded-full">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{item.name}</p>
                        <p className="text-[10px] text-zinc-500">Rozmiar: {item.selectedSize}</p>
                        <p className="font-mono text-sm text-[#00f2ff]">€{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-zinc-800 pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Produkty</span>
                    <span className="font-mono">€{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Wysyłka</span>
                    <span className={`font-mono ${shipping === 0 ? 'text-[#adff2f]' : ''}`}>
                      {shipping === 0 ? 'GRATIS' : `€${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="border-t border-zinc-800 pt-3 flex justify-between">
                    <span className="font-black uppercase">Razem</span>
                    <span className="text-xl font-mono font-black text-gradient-street">€{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
