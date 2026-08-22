import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, DollarSign, ShieldCheck, Ticket, Download, ArrowRight, User, HelpCircle, FileText, CheckCircle2, RefreshCw } from 'lucide-react';
import { FloatingMonstera, FloatingHibiscus, HibiscusSVG } from './TropicalDecorations';
import { PaymentReceipt } from '../types';

interface PaymentSystemProps {
  initialConcept?: string;
  initialAmount?: number;
  receipts: PaymentReceipt[];
  setReceipts: React.Dispatch<React.SetStateAction<PaymentReceipt[]>>;
  addNotification: (title: string, description: string, type: 'evento' | 'clase' | 'pago' | 'alerta') => void;
  onPaymentComplete: () => void;
}

export const PaymentSystem: React.FC<PaymentSystemProps> = ({
  initialConcept = '',
  initialAmount = 0,
  receipts,
  setReceipts,
  addNotification,
  onPaymentComplete,
}) => {
  // Payment Type
  const [paymentType, setPaymentType] = useState<'suscripcion' | 'personalizado'>(
    initialConcept ? 'personalizado' : 'suscripcion'
  );

  // Subscription selection
  const [selectedPlan, setSelectedPlan] = useState<'basico' | 'premium' | 'full'>('basico');
  const plans = {
    basico: { name: 'Adhérent Basique', price: 45, desc: 'Accès à 2 cours réguliers par semaine à Fontenay et entrée aux soirées sociales standard.' },
    premium: { name: 'Adhérent Premium', price: 75, desc: 'Accès à 4 cours par semaine, 1 stage intensif gratuit par mois et bibliothèque virtuelle complète.' },
    full: { name: 'Full Pass Maloka !', price: 95, desc: 'Accès illimité à tous les cours (Fontenay & La Queue), tous les stages et pass VIP festivals.' },
  };

  // Custom Payment Inputs
  const [customConcept, setCustomConcept] = useState(initialConcept || 'Cotisation Générale');
  const [customAmount, setCustomAmount] = useState<number>(initialAmount || 45);

  // Card Inputs
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Payment Status states
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'form' | 'success'>('form');
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);

  // Set initial amounts if props change
  useEffect(() => {
    if (initialConcept && initialAmount) {
      setCustomConcept(initialConcept);
      setCustomAmount(initialAmount);
      setPaymentType('personalizado');
    }
  }, [initialConcept, initialAmount]);

  const saveReceipt = (newReceipt: PaymentReceipt) => {
    const updated = [newReceipt, ...receipts];
    setReceipts(updated);
    localStorage.setItem('maloka_receipts', JSON.stringify(updated));
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();

    if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
      alert('Veuillez remplir toutes les informations de votre carte bancaire.');
      return;
    }

    setIsProcessing(true);

    const concept = paymentType === 'suscripcion' ? `Cotisation : ${plans[selectedPlan].name}` : customConcept;
    const amount = paymentType === 'suscripcion' ? plans[selectedPlan].price : customAmount;

    // Simulate payment gateway delay (Stripe/PayPal style loader)
    setTimeout(() => {
      const newReceipt: PaymentReceipt = {
        id: 'rec-' + Math.floor(Math.random() * 90000 + 10000),
        concept,
        amount,
        date: new Date().toLocaleDateString('fr-FR'),
        status: 'Complété',
        paymentMethod: 'Carte de Crédit (Visa/MC)',
        userName: cardName,
      };

      saveReceipt(newReceipt);
      setReceipt(newReceipt);
      setIsProcessing(false);
      setPaymentStep('success');

      addNotification(
        'Paiement Confirmé 💳',
        `Nous avons bien reçu votre paiement de ${amount}€ pour : "${concept}". Merci beaucoup pour votre soutien !`,
        'pago'
      );

      // Trigger callback
      onPaymentComplete();
    }, 2200);
  };


  const handleResetForm = () => {
    setPaymentStep('form');
    setCardName('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setReceipt(null);
  };

  const handleCardNumberChange = (value: string) => {
    const numeric = value.replace(/\D/g, '');
    const limited = numeric.slice(0, 16);
    const matches = limited.match(/\d{4}/g);
    if (matches) {
      setCardNumber(matches.join(' '));
    } else {
      setCardNumber(limited);
    }
  };

  const handleCardExpiryChange = (value: string) => {
    const numeric = value.replace(/\D/g, '');
    const limited = numeric.slice(0, 4);
    if (limited.length >= 2) {
      setCardExpiry(`${limited.slice(0, 2)}/${limited.slice(2)}`);
    } else {
      setCardExpiry(limited);
    }
  };

  const handleCardCvvChange = (value: string) => {
    const numeric = value.replace(/\D/g, '');
    setCardCvv(numeric.slice(0, 3));
  };

  return (
    <div className="relative py-12 md:py-16 bg-white dark:bg-zinc-950 min-h-screen">
      
      {/* Tropical background decorations */}
      <FloatingMonstera delay={1} size="w-36 h-36" className="absolute top-10 -left-12 text-emerald-500/10 pointer-events-none" />
      <FloatingHibiscus delay={3} size="w-24 h-24" className="absolute bottom-10 -right-12 text-rose-500/10 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header section */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
          <div className="flex justify-center text-orange-500">
            <CreditCard className="w-10 h-10 animate-bounce" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Portail de Paiement Sécurisé 💳
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 font-light text-sm">
            Réglez vos cotisations ou réservez vos stages intensifs de danse en toute tranquillité ! Connecté de manière sécurisée (simulation Stripe/PayPal) pour votre confort et sécurité.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {paymentStep === 'success' && receipt ? (
            /* 1. SUCCESS RECEIPT PAGE VIEW */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl border-2 border-emerald-500/30 p-8 shadow-xl max-w-xl mx-auto text-center relative overflow-hidden"
            >
              {/* Top border decor */}
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />

              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={40} className="animate-pulse" />
              </div>

              <h3 className="text-2xl font-black text-zinc-900 dark:text-white">Transaction Réussie</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Le prélèvement bancaire a été effectué avec succès via la passerelle Stripe. Félicitations !</p>

              {/* Receipt card layout */}
              <div className="my-8 p-6 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/50 dark:border-zinc-800 rounded-2xl text-left font-mono text-xs text-zinc-800 dark:text-zinc-200 space-y-3.5 relative overflow-hidden">
                {/* Simulated ribbon */}
                <span className="absolute top-2.5 right-2.5 bg-emerald-500 text-white uppercase text-[8px] tracking-widest font-bold px-2.5 py-0.5 rounded">
                  PAYÉ
                </span>

                <div className="flex justify-between border-b border-zinc-200/60 dark:border-zinc-800 pb-3">
                  <span className="font-bold">REÇU DE TRANSACTION</span>
                  <span className="text-rose-500 font-bold">{receipt.id}</span>
                </div>

                <div className="grid grid-cols-2 gap-y-2 pt-2">
                  <span className="text-zinc-400 uppercase tracking-wider font-semibold text-[10px]">Adhérent</span>
                  <span className="text-right font-bold text-zinc-800 dark:text-zinc-200">{receipt.userName}</span>

                  <span className="text-zinc-400 uppercase tracking-wider font-semibold text-[10px]">Concept</span>
                  <span className="text-right font-bold text-zinc-800 dark:text-zinc-200">{receipt.concept}</span>

                  <span className="text-zinc-400 uppercase tracking-wider font-semibold text-[10px]">Date</span>
                  <span className="text-right font-semibold text-zinc-800 dark:text-zinc-200">{receipt.date}</span>

                  <span className="text-zinc-400 uppercase tracking-wider font-semibold text-[10px]">Méthode de Paiement</span>
                  <span className="text-right text-zinc-800 dark:text-zinc-200">{receipt.paymentMethod}</span>
                </div>

                <div className="flex justify-between border-t border-zinc-200/60 dark:border-zinc-800 pt-3 text-sm">
                  <span className="font-extrabold text-zinc-900 dark:text-white">TOTAL RÉGLÉ :</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-base">{receipt.amount} €</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  id="checkout-another-payment-btn"
                  onClick={handleResetForm}
                  className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Faire un Autre Paiement
                </button>
                <button
                  id="receipt-print-btn"
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
                >
                  <Download size={12} className="inline-block mr-1.5" /> Télécharger Reçu
                </button>
              </div>
            </motion.div>
          ) : (
            /* 2. PAYMENT CONFIG & CREDIT CARD SUBMISSION FORM */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column - Subscription plan configuration */}
              <div className="lg:col-span-7 space-y-6 text-left">
                
                {/* Mode tabs */}
                <div className="grid grid-cols-2 gap-2 bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-2xl border border-zinc-200/60 dark:border-zinc-800">
                  <button
                    id="payment-mode-sub"
                    onClick={() => setPaymentType('suscripcion')}
                    className={`py-2.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                      paymentType === 'suscripcion'
                        ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    Cotisation d'Adhésion
                  </button>
                  <button
                    id="payment-mode-custom"
                    onClick={() => setPaymentType('personalizado')}
                    className={`py-2.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                      paymentType === 'personalizado'
                        ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    Règlement Libre / Stage
                  </button>
                </div>

                {paymentType === 'suscripcion' ? (
                  /* Option A - Monthly memberships list selector */
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Choisissez votre Formule de Membre :</h3>
                    
                    {(Object.keys(plans) as Array<keyof typeof plans>).map((key) => {
                      const isActive = selectedPlan === key;
                      const plan = plans[key];
                      return (
                        <div
                          key={key}
                          id={`plan-card-${key}`}
                          onClick={() => setSelectedPlan(key)}
                          className={`p-5 rounded-2xl border transition-all cursor-pointer flex justify-between gap-4 items-center ${
                            isActive
                              ? 'border-rose-500 bg-rose-50/20 dark:bg-rose-950/20 shadow-md'
                              : 'border-zinc-200 dark:border-zinc-800 hover:border-rose-300'
                          }`}
                        >
                          <div className="space-y-1.5 max-w-sm">
                            <div className="flex items-center gap-2">
                              <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isActive ? 'border-rose-500 text-rose-500 bg-rose-100' : 'border-zinc-300'
                              }`}>
                                {isActive && <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />}
                              </span>
                              <h4 className="font-extrabold text-zinc-900 dark:text-white text-sm">{plan.name}</h4>
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-light">{plan.desc}</p>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xl font-black text-rose-500">{plan.price}€</span>
                            <p className="text-[10px] text-zinc-400 uppercase font-semibold">Mensuel</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Option B - Customized single charge panel */
                  <div className="bg-orange-50/20 dark:bg-zinc-900/30 border border-orange-100/50 dark:border-zinc-800 p-6 rounded-3xl space-y-4">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Détails de votre Règlement :</h3>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-500">Motif du Paiement (Stage, Événement, Soirée) :</label>
                      <input
                        id="custom-payment-concept"
                        type="text"
                        required
                        value={customConcept}
                        onChange={(e) => setCustomConcept(e.target.value)}
                        placeholder="Ex. Stage Intensif Salsa & Cardio Latino"
                        className="w-full px-4 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm text-zinc-800 dark:text-zinc-200"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-500">Montant à Régler (€) :</label>
                      <div className="relative">
                        <span className="absolute left-4 top-3 text-zinc-400 font-bold">€</span>
                        <input
                          id="custom-payment-amount"
                          type="number"
                          required
                          min={5}
                          value={customAmount}
                          onChange={(e) => setCustomAmount(parseInt(e.target.value) || 0)}
                          className="w-full pl-8 pr-4 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold text-sm text-zinc-800 dark:text-zinc-200"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Secure certificate reassurance */}
                <div className="p-4 bg-emerald-50/50 dark:bg-zinc-900/40 border border-emerald-100/50 dark:border-emerald-900/20 rounded-2xl flex gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                  <ShieldCheck size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 block">Connexion Chiffrée SSL</span>
                    <p className="text-[11px] leading-relaxed mt-0.5">La passerelle utilise des certificats avancés pour chiffrer vos numéros de carte. L'association ne conserve aucune donnée bancaire sur ses serveurs.</p>
                  </div>
                </div>
              </div>

              {/* Right Column - Beautiful Credit Card styled Interface form */}
              <div className="lg:col-span-5 space-y-6 text-left">
                
                {/* Realistic Card Graphic preview */}
                <div className="relative bg-gradient-to-tr from-orange-500 via-rose-500 to-rose-600 rounded-3xl p-6 text-white shadow-xl shadow-rose-500/10 aspect-[1.586/1] overflow-hidden flex flex-col justify-between max-w-sm mx-auto">
                  {/* Decorative background plants inside card graphic */}
                  <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <FloatingMonstera size="w-32 h-32" className="absolute -top-6 -right-6 text-white" />
                    <FloatingHibiscus size="w-24 h-24" className="absolute -bottom-6 -left-6 text-white" />
                  </div>

                  <div className="flex justify-between items-start relative z-10">
                    <span className="text-xs uppercase font-bold tracking-widest font-mono">Maloka Pay</span>
                    <span className="text-xl">💳</span>
                  </div>

                  <div className="space-y-4 relative z-10">
                    {/* Simulated card digits */}
                    <p className="text-base sm:text-lg md:text-xl font-mono tracking-widest text-center">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </p>

                    <div className="flex justify-between items-end font-mono">
                      <div>
                        <p className="text-[8px] uppercase tracking-wider text-rose-100 font-semibold">Titulaire</p>
                        <p className="text-xs font-bold uppercase truncate max-w-[160px]">
                          {cardName || 'Titulaire de la Carte'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] uppercase tracking-wider text-rose-100 font-semibold">Expiration</p>
                        <p className="text-xs font-bold">
                          {cardExpiry || 'MM/AA'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form capturing card parameters */}
                <form onSubmit={handlePay} className="space-y-4 max-w-sm mx-auto">
                  
                  {/* Cardholder Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-500 block">Nom complet du Titulaire :</label>
                    <input
                      id="card-form-name"
                      type="text"
                      required
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Ex. Sofía Vergara"
                      className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm text-zinc-800 dark:text-zinc-200"
                    />
                  </div>

                  {/* Card Number */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-500 block">Numéro de Carte Bancaire :</label>
                    <input
                      id="card-form-number"
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      placeholder="4000 1234 5678 9010"
                      className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm font-mono text-zinc-800 dark:text-zinc-200"
                    />
                  </div>

                  {/* Expiry & CVV */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-500 block">Expiration (MM/AA) :</label>
                      <input
                        id="card-form-expiry"
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={(e) => handleCardExpiryChange(e.target.value)}
                        placeholder="MM/AA"
                        className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm font-mono text-center text-zinc-800 dark:text-zinc-200"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-zinc-500 block">Cryptogramme (CVV) :</label>
                      <input
                        id="card-form-cvv"
                        type="password"
                        required
                        value={cardCvv}
                        onChange={(e) => handleCardCvvChange(e.target.value)}
                        placeholder="•••"
                        className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm font-mono text-center text-zinc-800 dark:text-zinc-200"
                      />
                    </div>
                  </div>

                  {/* Submission and loading action triggers */}
                  <button
                    id="submit-card-checkout-btn"
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 via-rose-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/15 hover:shadow-rose-500/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Connexion Passerelle...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirmer le Paiement Sécurisé</span>
                      </>
                    )}
                  </button>
                </form>

              </div>

            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
