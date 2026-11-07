import React, { useState } from 'react';
import { X, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { loginWithGoogle, loginWithApple } from '../lib/firebase';
import { UserProfile } from '../types';
import { TikFlowLogo } from './SplashScreen';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const REGISTRATION_COUNTRIES = [
  { code: 'HT', name: 'Haïti', flag: '🇭🇹', monetizationEligible: true },
  { code: 'FR', name: 'France', flag: '🇫🇷', monetizationEligible: false },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', monetizationEligible: false },
  { code: 'US', name: 'États-Unis', flag: '🇺🇸', monetizationEligible: false },
  { code: 'BE', name: 'Belgique', flag: '🇧🇪', monetizationEligible: false },
  { code: 'CH', name: 'Suisse', flag: '🇨🇭', monetizationEligible: false },
  { code: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮', monetizationEligible: false },
  { code: 'SN', name: 'Sénégal', flag: '🇸🇳', monetizationEligible: false },
  { code: 'CM', name: 'Cameroun', flag: '🇨🇲', monetizationEligible: false },
  { code: 'MA', name: 'Maroc', flag: '🇲🇦', monetizationEligible: false },
  { code: 'DO', name: 'République Dominicaine', flag: '🇩🇴', monetizationEligible: false },
  { code: 'BR', name: 'Brésil', flag: '🇧🇷', monetizationEligible: false },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState<'google' | 'apple' | 'demo' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>(() => {
    try {
      return localStorage.getItem('tokvibe_user_country') || '';
    } catch {
      return '';
    }
  });

  if (!isOpen) return null;

  const isHaitiSelected = selectedCountry === 'Haïti';

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    setErrorMsg(null);
    if (country) {
      try {
        localStorage.setItem('tokvibe_user_country', country);
      } catch {}
    }
  };

  const validateCountryBeforeAuth = (): boolean => {
    if (!selectedCountry.trim()) {
      setErrorMsg("Action requise : Vous devez obligatoirement sélectionner votre pays d'origine pour vous inscrire sur l'application.");
      return false;
    }
    return true;
  };

  const handleGoogleAuth = async () => {
    if (!validateCountryBeforeAuth()) return;
    try {
      setLoading('google');
      setErrorMsg(null);
      const res = await loginWithGoogle();
      const fbUser = res.user;

      const profile: UserProfile = {
        uid: fbUser.uid,
        email: fbUser.email || undefined,
        displayName: fbUser.displayName || 'TikFlow Creator',
        handle: (fbUser.displayName || 'user').toLowerCase().replace(/\s+/g, '_') + '_' + fbUser.uid.slice(0, 4),
        photoURL: fbUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        bio: 'Créateur de contenu sur TokVibe 🎬 Passionné par les vidéos courtes et l\'IA.',
        followersCount: 14200,
        followingCount: 38,
        likesReceived: 1250,
        isCreator: true,
        idCountry: selectedCountry,
        monetizationEnabled: isHaitiSelected,
        walletBalance: isHaitiSelected ? 48.50 : 0,
        theme: 'black',
        accent: 'TokVibe',
        language: 'fr',
        privateAccount: false,
        allowComments: 'everyone',
        activityStatus: true,
        aiRecommenderVibe: 'balanced',
      };

      onSuccess(profile);
      onClose();
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setErrorMsg(err?.message || 'Erreur lors de la connexion Google.');
    } finally {
      setLoading(null);
    }
  };

  const handleAppleAuth = async () => {
    if (!validateCountryBeforeAuth()) return;
    try {
      setLoading('apple');
      setErrorMsg(null);
      const res = await loginWithApple();
      const fbUser = res.user;

      const profile: UserProfile = {
        uid: fbUser.uid,
        email: fbUser.email || undefined,
        displayName: fbUser.displayName || 'Membre Apple',
        handle: 'apple_user_' + fbUser.uid.slice(0, 4),
        photoURL: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        bio: 'Utilisateur TokVibe authentifié via Apple ID ',
        followersCount: 14200,
        followingCount: 24,
        likesReceived: 840,
        isCreator: true,
        idCountry: selectedCountry,
        monetizationEnabled: isHaitiSelected,
        walletBalance: isHaitiSelected ? 25.00 : 0,
        theme: 'black',
        accent: 'TokVibe',
        language: 'fr',
        privateAccount: false,
        allowComments: 'everyone',
        activityStatus: true,
        aiRecommenderVibe: 'balanced',
      };

      onSuccess(profile);
      onClose();
    } catch (err: any) {
      console.warn('Apple Auth popup returned:', err);
      setErrorMsg('Apple Sign In nécessite la clé Service ID Apple dans la console Firebase. Connexion simulée en cours...');
      setTimeout(() => {
        const fallbackAppleProfile: UserProfile = {
          uid: 'apple_' + Math.random().toString(36).substring(2, 9),
          email: 'user@privaterelay.appleid.com',
          displayName: 'Alex Apple User',
          handle: 'alex_apple',
          photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          bio: 'Connecté avec succès via Apple ID sécurisé ',
          followersCount: 14200,
          followingCount: 52,
          likesReceived: 2180,
          isCreator: true,
          idCountry: selectedCountry,
          monetizationEnabled: isHaitiSelected,
          walletBalance: isHaitiSelected ? 65.40 : 0,
          theme: 'black',
          accent: 'TokVibe',
          language: 'fr',
          privateAccount: false,
          allowComments: 'everyone',
          activityStatus: true,
          aiRecommenderVibe: 'creative',
        };
        onSuccess(fallbackAppleProfile);
        onClose();
      }, 900);
    } finally {
      setLoading(null);
    }
  };

  const handleDemoAuth = () => {
    if (!validateCountryBeforeAuth()) return;
    setLoading('demo');
    setTimeout(() => {
      const demoProfile: UserProfile = {
        uid: 'user_demo_123',
        email: 'demo@tikflow.app',
        displayName: 'Adam Lorgeat',
        handle: 'adam_flow',
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        bio: 'Créateur & Curateur TokVibe 🔥 En quête des vidéos les plus créatives du web.',
        followersCount: 14200,
        followingCount: 230,
        likesReceived: 98400,
        isCreator: true,
        idCountry: selectedCountry,
        monetizationEnabled: isHaitiSelected,
        walletBalance: isHaitiSelected ? 342.80 : 0,
        theme: 'black',
        accent: 'TokVibe',
        language: 'fr',
        privateAccount: false,
        allowComments: 'everyone',
        activityStatus: true,
        aiRecommenderVibe: 'viral',
      };
      onSuccess(demoProfile);
      setLoading(null);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-sm bg-zinc-950 border border-white/10 rounded-3xl p-5 shadow-2xl overflow-hidden max-h-[94dvh] overflow-y-auto no-scrollbar">
        {/* Glow ambient */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#FE2C55]/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-[#25F4EE]/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-white/50 hover:text-white bg-white/5 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mt-1 mb-4">
          <div className="mb-2.5 flex justify-center">
            <TikFlowLogo size="lg" />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">
            Inscription TokVibe
          </h2>
          <p className="text-xs text-white/60 mt-1 max-w-[270px] mx-auto">
            Sélectionnez obligatoirement votre pays d'origine pour créer votre compte.
          </p>
        </div>

        {/* Mandatory Country of Origin Selector */}
        <div className="mb-4 p-3.5 rounded-2xl bg-zinc-900/90 border border-white/15 text-left space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-white block">
              1. Sélectionnez votre pays d'origine *
            </label>
            <span
              className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                selectedCountry
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {selectedCountry ? `${selectedCountry} ✓` : 'Obligatoire'}
            </span>
          </div>

          {/* Quick Selection Pills for Top Countries */}
          <div className="grid grid-cols-3 gap-1.5">
            {REGISTRATION_COUNTRIES.slice(0, 6).map((c) => {
              const active = selectedCountry === c.name;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleCountryChange(c.name)}
                  className={`py-2 px-2 rounded-xl border text-[11px] font-extrabold flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer ${
                    active
                      ? 'bg-[#25F4EE]/20 border-[#25F4EE] text-white shadow'
                      : 'bg-zinc-950 border-white/10 text-white/70 hover:text-white'
                  }`}
                >
                  <span>{c.flag}</span>
                  <span className="truncate">{c.name}</span>
                </button>
              );
            })}
          </div>

          {/* Full Country Dropdown */}
          <select
            value={selectedCountry}
            onChange={(e) => handleCountryChange(e.target.value)}
            className={`w-full py-2.5 px-3 rounded-xl bg-zinc-950 border text-white text-xs font-bold focus:outline-none ${
              selectedCountry
                ? 'border-emerald-500/50 focus:border-emerald-400'
                : 'border-amber-500/50 focus:border-[#25F4EE]'
            }`}
          >
            <option value="">-- Choisir mon pays d'origine (Obligatoire) --</option>
            {REGISTRATION_COUNTRIES.map((c) => (
              <option key={c.code} value={c.name}>
                {c.flag} {c.name} {c.monetizationEligible ? '(Programme Monétisation Actif)' : ''}
              </option>
            ))}
          </select>

          {selectedCountry && (
            <p className="text-[10px] text-white/60 leading-snug">
              {isHaitiSelected
                ? '🇭🇹 Pays d\'origine Haïti sélectionné : vous aurez accès au Programme de Monétisation TokVibe.'
                : `🌍 Pays d'origine ${selectedCountry} sélectionné : le Programme de Monétisation est réservé uniquement à Haïti et ne sera pas visible.`}
            </p>
          )}
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 text-left font-bold">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {/* Google Button */}
          <button
            onClick={handleGoogleAuth}
            disabled={loading !== null}
            className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-xs flex items-center justify-center gap-3 transition-all active:scale-95 shadow-md disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            {loading === 'google' ? 'Connexion en cours...' : 'Continuer avec Google'}
          </button>

          {/* Apple Button */}
          <button
            onClick={handleAppleAuth}
            disabled={loading !== null}
            className="w-full py-3 px-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs flex items-center justify-center gap-3 border border-white/15 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.6-7.79-11.74-14.24-6.42-10.09-11.45-21.72-15.09-34.88-3.64-13.16-5.46-25.07-5.46-35.73 0-14.54 3.73-26.69 11.2-36.46 7.46-9.76 16.92-14.75 28.37-14.97 4.9 0 10.19 1.25 15.87 3.76 5.68 2.5 9.77 3.86 12.28 4.09 1.96-.23 6.1-1.63 12.42-4.2 6.32-2.58 11.75-3.71 16.29-3.39 12.74.87 22.84 5.75 30.3 14.65-10.99 6.64-16.38 15.67-16.16 27.09.22 8.92 3.69 16.43 10.42 22.52 6.73 6.09 14.68 9.69 23.86 10.78-2.39 7.07-5.35 14.69-8.87 22.85zM119.22 31.84c0-7.39 2.67-14.35 8.01-20.89 5.34-6.53 11.96-10.56 19.86-12.09.22 1.09.33 2.18.33 3.27 0 7.39-2.73 14.47-8.19 21.24-5.46 6.77-12.18 10.82-20.16 12.16-.1-1.2-.15-2.43-.15-3.69z" />
            </svg>
            {loading === 'apple' ? 'Connexion en cours...' : 'Continuer avec Apple'}
          </button>

          {/* Guest / Fast Demo */}
          <button
            onClick={handleDemoAuth}
            disabled={loading !== null}
            className="w-full py-2.5 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white/80 font-medium text-xs flex items-center justify-center gap-2 border border-white/5 transition cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#25F4EE]" />
            Valider mon inscription ({selectedCountry || 'Choisir un pays'})
          </button>
        </div>

        {/* Security badge */}
        <div className="mt-5 pt-3.5 border-t border-white/10 flex items-center justify-center gap-2 text-[10px] text-white/40">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Authentification sécurisée par Firebase Auth & Cloud Security</span>
        </div>
      </div>
    </div>
  );
};
