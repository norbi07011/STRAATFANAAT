import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, X } from 'lucide-react';
import { ui } from '../lib/i18n';
import { img } from '../lib/media';
import { joinWaitlist } from '../lib/signups';
import { useStore } from './store';
import { useNav } from './nav';
import { Btn } from './ui';

type Status = 'idle' | 'sending' | 'done' | 'error';

export const WaitlistModal = () => {
  const { lang, waitlistProduct: product, openWaitlist } = useStore();
  const { lenis } = useNav();
  const u = ui(lang);
  const [type, setType] = useState<'email' | 'whatsapp'>('email');
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    if (product) {
      setStatus('idle');
      setValue('');
      lenis.current?.stop();
    } else {
      lenis.current?.start();
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && openWaitlist(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [product, lenis, openWaitlist]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !value.trim()) return;
    setStatus('sending');
    try {
      await joinWaitlist({ productId: product.id, productName: product.name, contactType: type, contact: value, language: lang });
      setStatus('done');
    } catch (err) {
      console.error('Waitlist error:', err);
      setStatus('error');
    }
  };

  return (
    <AnimatePresence>
      {product && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={u.waitlistTitle}>
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => openWaitlist(null)}
          />
          <motion.div
            className="relative grid w-full max-w-3xl overflow-hidden bg-paper text-black sm:grid-cols-[2fr_3fr]"
            initial={{ y: 60, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              onClick={() => openWaitlist(null)}
              className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center bg-paper"
              aria-label={u.close}
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative hidden bg-asphalt sm:block">
              <img src={img(product.image)} alt={product.name} className="h-full w-full object-cover" />
              <span className="absolute left-0 top-0 bg-haag-yellow px-3 py-1.5 text-sm font-bold">{u.comingSoon}</span>
            </div>

            <div className="p-6 sm:p-8">
              <AnimatePresence mode="wait">
                {status === 'done' ? (
                  <motion.div key="done" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 py-6">
                    <motion.span
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                      className="flex h-14 w-14 items-center justify-center bg-haag-green text-white"
                    >
                      <Check className="h-8 w-8" strokeWidth={3} />
                    </motion.span>
                    <h3 className="font-banner text-6xl">{u.waitlistDone}</h3>
                    <p className="text-black/70">{u.waitlistDoneText}</p>
                  </motion.div>
                ) : (
                  <motion.form key="form" onSubmit={submit} exit={{ opacity: 0, y: -12 }} className="flex flex-col gap-5">
                    <div>
                      <p className="text-sm font-semibold text-haag-green">{product.name}</p>
                      <h3 className="font-banner mt-1 text-6xl">{u.waitlistTitle}</h3>
                      <p className="mt-3 max-w-prose text-black/70">{u.waitlistText}</p>
                    </div>

                    <div className="grid grid-cols-2 border-2 border-black" role="tablist">
                      {(['email', 'whatsapp'] as const).map((k) => (
                        <button
                          key={k}
                          type="button"
                          role="tab"
                          aria-selected={type === k}
                          onClick={() => setType(k)}
                          className="relative py-3 font-semibold"
                        >
                          {type === k && <motion.span layoutId="wl-tab" className="absolute inset-0 bg-black" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
                          <span className={`relative ${type === k ? 'text-white' : ''}`}>{k === 'email' ? u.email : u.whatsapp}</span>
                        </button>
                      ))}
                    </div>

                    <label className="flex flex-col gap-2">
                      <span className="sr-only">{type === 'email' ? u.email : u.whatsapp}</span>
                      <input
                        type={type === 'email' ? 'email' : 'tel'}
                        required
                        autoComplete={type === 'email' ? 'email' : 'tel'}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={type === 'email' ? u.emailPh : u.phonePh}
                        className="w-full border-b-2 border-black bg-transparent py-3 text-lg outline-none placeholder:text-black/35 focus:border-haag-green"
                      />
                    </label>

                    {status === 'error' && <p className="text-sm font-semibold text-red-700">{u.waitlistError}</p>}

                    <Btn type="submit" variant="black" disabled={status === 'sending'} className="w-full">
                      {status === 'sending' ? u.sending : u.notifyMe}
                    </Btn>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
