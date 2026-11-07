import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Moon,
  Sun,
  Laptop,
  Globe2,
  Sparkles,
  Sliders,
  RotateCcw,
  Palette,
  Check,
  Zap,
  Play,
  Wifi,
  ShieldCheck,
  User,
  Shield,
  DollarSign,
  Eye,
  BarChart3,
  Scissors,
  Radio,
  LogOut,
  Search,
  Upload,
  Calendar,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Clock,
  ChevronRight,
  BatteryCharging,
  PauseCircle,
  PlayCircle,
  Cpu,
} from 'lucide-react';
import { ThemeMode, AccentColor, SupportedLanguage, AIPreferences, UserProfile } from '../types';
import { translations } from '../lib/i18n';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsModalProps {
  currentTheme: ThemeMode;
  currentAccent: AccentColor;
  currentLanguage: SupportedLanguage;
  aiPrefs: AIPreferences;
  autoplayEnabled: boolean;
  currentUser?: UserProfile | null;
  onUpdateTheme: (theme: ThemeMode) => void;
  onUpdateAccent: (accent: AccentColor) => void;
  onUpdateLanguage: (lang: SupportedLanguage) => void;
  onUpdateAiPrefs: (prefs: AIPreferences) => void;
  onToggleAutoplay: (enabled: boolean) => void;
  onToggleVerification?: (verified: boolean) => void;
  onOpenEditProfile?: () => void;
  onOpenProfileVisitors?: () => void;
  onOpenVideoAnalytics?: () => void;
  onOpenCreatorStudio?: () => void;
  onOpenStudioEditor?: () => void;
  onOpenPrivacy?: () => void;
  onLockAppImmediately?: () => void;
  onOpenLive?: () => void;
  onLogout?: () => void;
  onReplaySplash: () => void;
  onClose: () => void;
  onUpdateProfile?: (data: Partial<UserProfile>) => void;
  powerSavingMode?: boolean;
  onTogglePowerSaving?: (enabled: boolean) => void;
  prolongedSessionThresholdMins?: number;
  onUpdateProlongedThreshold?: (mins: number) => void;
  sessionWatchMinutes?: number;
  isAiPausedByPowerSave?: boolean;
  onSimulateProlongedSession?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  currentTheme,
  currentAccent,
  currentLanguage,
  aiPrefs,
  autoplayEnabled,
  currentUser,
  onUpdateTheme,
  onUpdateAccent,
  onUpdateLanguage,
  onUpdateAiPrefs,
  onToggleAutoplay,
  onToggleVerification,
  onOpenEditProfile,
  onOpenProfileVisitors,
  onOpenVideoAnalytics,
  onOpenCreatorStudio,
  onOpenStudioEditor,
  onOpenPrivacy,
  onLockAppImmediately,
  onOpenLive,
  onLogout,
  onReplaySplash,
  onClose,
  onUpdateProfile,
  powerSavingMode: propPowerSaving,
  onTogglePowerSaving,
  prolongedSessionThresholdMins: propThresholdMins,
  onUpdateProlongedThreshold,
  sessionWatchMinutes = 0,
  isAiPausedByPowerSave: propAiPaused,
  onSimulateProlongedSession,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'theme' | 'ai' | 'lang' | 'verification'>('profile');
  const [localAiPrefs, setLocalAiPrefs] = useState<AIPreferences>(aiPrefs);
  const [localPowerSaving, setLocalPowerSaving] = useState<boolean>(() => {
    if (propPowerSaving !== undefined) return propPowerSaving;
    try {
      return localStorage.getItem('tokvibe_power_saving') === 'true';
    } catch {
      return false;
    }
  });
  const [localThresholdMins, setLocalThresholdMins] = useState<number>(() => {
    if (propThresholdMins !== undefined) return propThresholdMins;
    try {
      return Number(localStorage.getItem('tokvibe_power_saving_threshold') || '15');
    } catch {
      return 15;
    }
  });

  useEffect(() => {
    if (propPowerSaving !== undefined) setLocalPowerSaving(propPowerSaving);
  }, [propPowerSaving]);

  useEffect(() => {
    if (propThresholdMins !== undefined) setLocalThresholdMins(propThresholdMins);
  }, [propThresholdMins]);

  const handleTogglePowerSave = (next: boolean) => {
    setLocalPowerSaving(next);
    try {
      localStorage.setItem('tokvibe_power_saving', String(next));
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('power-saving', next);
      }
    } catch {}
    onTogglePowerSaving?.(next);
  };

  const handleChangeThreshold = (mins: number) => {
    setLocalThresholdMins(mins);
    try {
      localStorage.setItem('tokvibe_power_saving_threshold', String(mins));
    } catch {}
    onUpdateProlongedThreshold?.(mins);
  };

  const effectiveAiPaused =
    propAiPaused !== undefined
      ? propAiPaused
      : localPowerSaving && (localThresholdMins === 0 || sessionWatchMinutes >= localThresholdMins);
  const [isVerifiedLocal, setIsVerifiedLocal] = useState<boolean>(currentUser?.isVerified || false);
  const [verificationStatusLocal, setVerificationStatusLocal] = useState<'none' | 'pending' | 'verified' | 'rejected'>(
    currentUser?.verificationStatus || (currentUser?.isVerified ? 'verified' : 'none')
  );
  const [langSearch, setLangSearch] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>(currentTheme);
  const [selectedAccent, setSelectedAccent] = useState<AccentColor>(currentAccent);
  const [themeSaveSuccess, setThemeSaveSuccess] = useState(false);

  useEffect(() => {
    setSelectedTheme(currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    setSelectedAccent(currentAccent);
  }, [currentAccent]);

  // Strict Verification Form State
  const [birthDate, setBirthDate] = useState<string>(currentUser?.birthDate || '2000-01-01');
  const [idCountry, setIdCountry] = useState<string>(() => {
    if (currentUser?.idCountry) return currentUser.idCountry;
    try {
      return localStorage.getItem('tokvibe_user_country') || 'Haïti';
    } catch {
      return 'Haïti';
    }
  });
  const isHaitiOrigin =
    idCountry.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === 'haiti';
  const [idType, setIdType] = useState<'passport' | 'id_card' | 'driver_license'>(currentUser?.idType || 'id_card');
  const [idFrontUploaded, setIdFrontUploaded] = useState<boolean>(false);
  const [idBackUploaded, setIdBackUploaded] = useState<boolean>(false);
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState<boolean>(false);
  const frontFileInputRef = useRef<HTMLInputElement>(null);
  const backFileInputRef = useRef<HTMLInputElement>(null);

  // Close immediately on hardware back button or ESC
  useEffect(() => {
    window.history.pushState({ modal: 'settings' }, '');
    const handlePop = () => {
      onClose();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('popstate', handlePop);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('popstate', handlePop);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleFrontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdFrontUploaded(true);
      setVerificationError(null);
    }
  };

  const handleBackUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdBackUploaded(true);
      setVerificationError(null);
    }
  };

  const calculateAge = (dobString: string): number => {
    if (!dobString) return 0;
    const dob = new Date(dobString);
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationError(null);

    if (!birthDate) {
      setVerificationError('Veuillez indiquer votre date de naissance.');
      return;
    }

    const calculatedAge = calculateAge(birthDate);
    if (calculatedAge < 18) {
      setVerificationError(`Condition stricte non remplie : Vous devez strictement avoir au moins 18 ans révolus pour obtenir le crochet vert 3D. (Âge détecté : ${calculatedAge} ans).`);
      return;
    }

    if (!idCountry.trim()) {
      setVerificationError('Veuillez renseigner le pays d\'origine où le compte a été créé.');
      return;
    }

    if (!idFrontUploaded || !idBackUploaded) {
      setVerificationError('Veuillez téléverser le recto ET le verso de votre pièce d\'identité officielle.');
      return;
    }

    if (!agreedToTerms) {
      setVerificationError('Vous devez accepter et certifier sur l\'honneur la conformité de vos informations.');
      return;
    }

    setVerificationStatusLocal('pending');
    onUpdateProfile?.({ verificationStatus: 'pending' });
    setVerificationSuccess(true);
    setTimeout(() => setVerificationSuccess(false), 5000);
  };

  const t = translations[currentLanguage] || translations.fr;

  const themeOptions: { id: ThemeMode; name: string; bg: string; border: string }[] = [
    { id: 'black', name: 'Noir Pur OLED', bg: 'bg-black', border: 'border-zinc-800' },
    { id: 'midnight', name: 'Minuit Cosmique', bg: 'bg-[#0B1120]', border: 'border-blue-900/50' },
    { id: 'cyber', name: 'Néon Cyberpunk', bg: 'bg-[#0F0E17]', border: 'border-purple-900/50' },
    { id: 'studio', name: 'Gris Studio', bg: 'bg-[#18181B]', border: 'border-zinc-700' },
  ];

  const accentOptions: { id: AccentColor; name: string; colorClass: string }[] = [
    { id: 'TokVibe', name: 'TokVibe Iconique', colorClass: 'from-[#FE2C55] to-[#25F4EE]' },
    { id: 'cyan', name: 'Cyan Électrique', colorClass: 'from-[#25F4EE] to-blue-500' },
    { id: 'rose', name: 'Rose Néon', colorClass: 'from-[#FE2C55] to-fuchsia-500' },
    { id: 'emerald', name: 'Vert Émeraude', colorClass: 'from-emerald-400 to-teal-500' },
    { id: 'amber', name: 'Or Ambré', colorClass: 'from-amber-400 to-orange-500' },
  ];

  const languages: { code: SupportedLanguage; label: string; nativeLabel: string; flag: string }[] = [
    { code: 'fr', label: 'Français', nativeLabel: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'Anglais', nativeLabel: 'English', flag: '🇬🇧' },
    { code: 'es', label: 'Espagnol', nativeLabel: 'Español', flag: '🇪🇸' },
    { code: 'de', label: 'Allemand', nativeLabel: 'Deutsch', flag: '🇩🇪' },
    { code: 'ar', label: 'Arabe', nativeLabel: 'العربية', flag: '🇸🇦' },
    { code: 'it', label: 'Italien', nativeLabel: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', label: 'Portugais', nativeLabel: 'Português', flag: '🇵🇹' },
    { code: 'ja', label: 'Japonais', nativeLabel: '日本語', flag: '🇯🇵' },
    { code: 'zh', label: 'Chinois', nativeLabel: '中文', flag: '🇨🇳' },
    { code: 'ko', label: 'Coréen', nativeLabel: '한국어', flag: '🇰🇷' },
    { code: 'tr', label: 'Turc', nativeLabel: 'Türkçe', flag: '🇹🇷' },
  ];

  const filteredLanguages = languages.filter(
    (l) =>
      l.label.toLowerCase().includes(langSearch.toLowerCase()) ||
      l.nativeLabel.toLowerCase().includes(langSearch.toLowerCase()) ||
      l.code.toLowerCase().includes(langSearch.toLowerCase())
  );

  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemPrefersDark(mediaQuery.matches);
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  const effectiveResolvedTheme =
    selectedTheme === 'system'
      ? systemPrefersDark
        ? 'black'
        : 'light'
      : selectedTheme === 'light'
      ? 'light'
      : 'black';

  const isLightModeActive = effectiveResolvedTheme === 'light';

  // Application immédiate en 1 clic (Mode Sombre, Mode Clair ou Système)
  const applyThemeImmediately = (targetMode: ThemeMode) => {
    const resolvedLight =
      targetMode === 'light' || (targetMode === 'system' && !systemPrefersDark);

    if (typeof document !== 'undefined') {
      if (resolvedLight) {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light', 'light-theme');
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.classList.remove('light', 'light-theme');
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'black');
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('tokvibe_theme', targetMode);
    }

    setSelectedTheme(targetMode);
    onUpdateTheme(targetMode);
    onUpdateProfile?.({ theme: targetMode });
    setThemeSaveSuccess(true);
    setTimeout(() => setThemeSaveSuccess(false), 3000);
  };

  // Bascule instantanée entre thème sombre et clair via le bouton flottant
  const handleQuickThemeToggle = () => {
    const nextTheme: ThemeMode = isLightModeActive ? 'black' : 'light';
    applyThemeImmediately(nextTheme);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="relative w-full max-w-md h-full bg-black flex flex-col overflow-hidden text-left">
        {/* Full-Screen TikTok Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/10 bg-zinc-950 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition active:scale-95"
            title="Retour"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#25F4EE]" />
            {t.saveSettings || 'Paramètres et confidentialité'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-white/60 hover:text-white bg-white/5 flex items-center justify-center transition active:scale-95"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/10 bg-black/50 text-[11px] font-bold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 px-2 text-center border-b-2 flex items-center justify-center gap-1 transition whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-[#25F4EE] text-white bg-white/5'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5 text-[#25F4EE]" /> Mon Profil
          </button>
          <button
            onClick={() => setActiveTab('theme')}
            className={`flex-1 py-3 px-2 text-center border-b-2 flex items-center justify-center gap-1 transition whitespace-nowrap ${
              activeTab === 'theme'
                ? 'border-[#FE2C55] text-white bg-white/5'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-400" /> Thème
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-3 px-2 text-center border-b-2 flex items-center justify-center gap-1 transition whitespace-nowrap ${
              activeTab === 'ai'
                ? 'border-[#25F4EE] text-white bg-white/5'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#25F4EE]" /> Algorithme
          </button>
          <button
            onClick={() => setActiveTab('lang')}
            className={`flex-1 py-3 px-2 text-center border-b-2 flex items-center justify-center gap-1 transition whitespace-nowrap ${
              activeTab === 'lang'
                ? 'border-purple-500 text-white bg-white/5'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5 text-purple-400" /> Langue
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`flex-1 py-3 px-2 text-center border-b-2 flex items-center justify-center gap-1 transition whitespace-nowrap ${
              activeTab === 'verification'
                ? 'border-[#22c55e] text-white bg-[#22c55e]/10'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#22c55e] shadow-[0_0_8px_#22c55e] shrink-0" /> Vérification
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 pb-20 space-y-5 text-xs">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {/* User Profile Summary Card */}
              {currentUser && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-black border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={currentUser.photoURL}
                        alt={currentUser.displayName}
                        className="w-11 h-11 rounded-full object-cover border border-white/20"
                      />
                      {currentUser.isVerified && (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#22c55e] border border-black flex items-center justify-center text-black">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-xs flex items-center gap-1">
                        <span>{currentUser.displayName}</span>
                        {currentUser.isVerified && (
                          <span
                            className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full"
                            style={{
                              background:
                                'radial-gradient(circle at 35% 35%, #86efac 0%, #22c55e 55%, #15803d 100%)',
                            }}
                          >
                            <Check className="w-2.5 h-2.5 stroke-[4] text-black" />
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-white/50">@{currentUser.handle}</p>
                    </div>
                  </div>
                  {onOpenEditProfile && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenEditProfile();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] transition active:scale-95"
                    >
                      Modifier
                    </button>
                  )}
                </div>
              )}

              {/* Pays d'origine de l'utilisateur inscrit */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                    <Globe2 className="w-3.5 h-3.5 text-[#25F4EE]" />
                    Pays d'origine du compte inscrit
                  </span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      isHaitiOrigin
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-zinc-800 text-white/60 border-white/10'
                    }`}
                  >
                    {isHaitiOrigin ? '🇭🇹 Monétisation Active' : `🌍 ${idCountry}`}
                  </span>
                </div>
                <select
                  value={idCountry}
                  onChange={(e) => {
                    const nextCountry = e.target.value;
                    setIdCountry(nextCountry);
                    try {
                      localStorage.setItem('tokvibe_user_country', nextCountry);
                    } catch {}
                    const nextIsHaiti =
                      nextCountry
                        .trim()
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '') === 'haiti';
                    onUpdateProfile?.({
                      idCountry: nextCountry,
                      monetizationEnabled: nextIsHaiti,
                    });
                  }}
                  className="w-full p-2.5 rounded-xl bg-zinc-950 border border-white/15 text-white text-xs font-bold focus:outline-none focus:border-[#25F4EE]"
                >
                  <option value="Haïti">🇭🇹 Haïti (Éligible Programme Monétisation)</option>
                  <option value="France">🇫🇷 France</option>
                  <option value="Canada">🇨🇦 Canada</option>
                  <option value="États-Unis">🇺🇸 États-Unis</option>
                  <option value="Belgique">🇧🇪 Belgique</option>
                  <option value="Suisse">🇨🇭 Suisse</option>
                  <option value="Côte d'Ivoire">🇨🇮 Côte d'Ivoire</option>
                  <option value="Sénégal">🇸🇳 Sénégal</option>
                  <option value="Cameroun">🇨🇲 Cameroun</option>
                  <option value="Maroc">🇲🇦 Maroc</option>
                  <option value="République Dominicaine">🇩🇴 République Dominicaine</option>
                </select>
                <p className="text-[10px] text-white/50 leading-snug">
                  {isHaitiOrigin
                    ? '🇭🇹 Pays d\'origine Haïti : le Programme de Monétisation TokVibe est disponible sur votre compte.'
                    : `🌍 Pays d'origine ${idCountry} : le Programme de Monétisation est réservé uniquement au pays Haïti et n'est pas visible pour les autres pays.`}
                </p>
              </div>

              {/* Universal Mobile & Tablet Install Banner (Apple, Android & Global Brands) */}
              <PWAInstallButton />

              {/* Grouped Profile Buttons Hub */}
              <div>
                <span className="text-[11px] font-extrabold text-white/70 block mb-2 uppercase tracking-wider">
                  Rassemblement des Outils & Action du Profil
                </span>
                <div className="rounded-2xl bg-black border border-white/10 divide-y divide-white/5 overflow-hidden shadow-2xl">
                  {onOpenEditProfile && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenEditProfile();
                      }}
                      className="w-full p-3.5 flex items-center justify-between hover:bg-white/[0.04] active:bg-white/[0.08] transition text-left group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 rounded-xl bg-white/10 text-white shrink-0 group-hover:scale-105 transition">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-white text-xs block truncate">Modifier Profil</span>
                          <span className="text-[10px] text-white/50 block truncate">Nom, biographie & avatar</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/70 transition shrink-0 ml-2" />
                    </button>
                  )}

                  {onOpenProfileVisitors && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenProfileVisitors();
                      }}
                      className="w-full p-3.5 flex items-center justify-between hover:bg-white/[0.04] active:bg-white/[0.08] transition text-left group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/20 shrink-0 group-hover:scale-105 transition">
                          <Eye className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-white text-xs block truncate">Vues du Profil</span>
                          <span className="text-[10px] text-blue-300/70 block truncate">Consultez qui a visité votre profil</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                          8 nouvelles vues
                        </span>
                        <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/70 transition" />
                      </div>
                    </button>
                  )}

                  {onOpenVideoAnalytics && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenVideoAnalytics();
                      }}
                      className="w-full p-3.5 flex items-center justify-between hover:bg-white/[0.04] active:bg-white/[0.08] transition text-left group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 rounded-xl bg-[#25F4EE]/15 text-[#25F4EE] border border-[#25F4EE]/20 shrink-0 group-hover:scale-105 transition">
                          <BarChart3 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-white text-xs block truncate">Stats Vidéos</span>
                          <span className="text-[10px] text-white/50 block truncate">Analyses d'audience & performances</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-[10px] font-bold text-[#25F4EE] bg-[#25F4EE]/10 px-2 py-0.5 rounded-full border border-[#25F4EE]/20">
                          Analyses
                        </span>
                        <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/70 transition" />
                      </div>
                    </button>
                  )}

                  {isHaitiOrigin && onOpenCreatorStudio && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenCreatorStudio();
                      }}
                      className="w-full p-3.5 flex items-center justify-between hover:bg-white/[0.04] active:bg-white/[0.08] transition text-left group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shrink-0 group-hover:scale-105 transition">
                          <DollarSign className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-white text-xs block truncate">Studio Créateur (Haïti 🇭🇹)</span>
                          <span className="text-[10px] text-emerald-400/80 block truncate">Revenus, pourboires et monétisation</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25">
                          ${currentUser?.walletBalance.toFixed(0) || '0'} Solde
                        </span>
                        <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/70 transition" />
                      </div>
                    </button>
                  )}

                  {onOpenStudioEditor && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenStudioEditor();
                      }}
                      className="w-full p-3.5 flex items-center justify-between hover:bg-white/[0.04] active:bg-white/[0.08] transition text-left group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/20 shrink-0 group-hover:scale-105 transition">
                          <Scissors className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-white text-xs block truncate">Studio Éditeur</span>
                          <span className="text-[10px] text-white/50 block truncate">Montage vidéo avancé & filtres</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-[10px] font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                          Éditeur
                        </span>
                        <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/70 transition" />
                      </div>
                    </button>
                  )}

                  {onOpenLive && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenLive();
                      }}
                      className="w-full p-3.5 flex items-center justify-between hover:bg-white/[0.04] active:bg-white/[0.08] transition text-left group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 rounded-xl bg-rose-500/15 text-[#FE2C55] border border-rose-500/20 shrink-0 group-hover:scale-105 transition">
                          <Radio className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-white text-xs block truncate">Direct Public LIVE</span>
                          <span className="text-[10px] text-rose-400 block truncate">Diffuser en direct auprès de votre communauté</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-[10px] font-black text-[#FE2C55] bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/25">
                          LIVE
                        </span>
                        <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/70 transition" />
                      </div>
                    </button>
                  )}

                  {onOpenPrivacy && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenPrivacy();
                      }}
                      className="w-full p-3.5 flex items-center justify-between hover:bg-white/[0.04] active:bg-white/[0.08] transition text-left group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20 shrink-0 group-hover:scale-105 transition">
                          <Shield className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-white text-xs block truncate">
                            Confidentialité, Biométrie &amp; Face ID
                          </span>
                          <span className="text-[10px] text-white/50 block truncate">
                            Verrouiller app immédiat, caméra de face &amp; biométrie téléphone
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          Face ID / Bio
                        </span>
                        <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/70 transition" />
                      </div>
                    </button>
                  )}

                  {onLockAppImmediately && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onLockAppImmediately();
                      }}
                      className="w-full p-3.5 flex items-center justify-between hover:bg-white/[0.04] active:bg-white/[0.08] transition text-left group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 rounded-xl bg-[#25F4EE]/15 text-[#25F4EE] border border-[#25F4EE]/25 shrink-0 group-hover:scale-105 transition">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-white text-xs block truncate">
                            Verrouiller l'Application Immédiatement
                          </span>
                          <span className="text-[10px] text-[#25F4EE]/80 block truncate">
                            Activer l'écran Face ID (Caméra de face) &amp; Biométrie
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-[10px] font-black text-[#25F4EE] bg-[#25F4EE]/10 px-2 py-0.5 rounded-full border border-[#25F4EE]/25">
                          Immédiat
                        </span>
                        <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/70 transition" />
                      </div>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setActiveTab('verification')}
                    className="w-full p-3.5 flex items-center justify-between hover:bg-white/[0.04] active:bg-white/[0.08] transition text-left group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 rounded-xl bg-emerald-500/15 text-[#22c55e] border border-emerald-500/20 shrink-0 group-hover:scale-105 transition">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-white text-xs block truncate">Boule Vert 3D</span>
                        <span className="text-[10px] text-white/50 block truncate">Badge de vérification officielle</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                        isVerifiedLocal
                          ? 'text-[#22c55e] bg-emerald-500/10 border-emerald-500/30'
                          : 'text-white/60 bg-white/5 border-white/10'
                      }`}>
                        {isVerifiedLocal ? 'Certifié Actif' : 'Activer le badge'}
                      </span>
                      <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/70 transition" />
                    </div>
                  </button>

                  {/* Mode d'Économie d'Énergie & Pause IA Prolongée (Accès Rapide) */}
                  <div className="w-full p-3.5 flex items-center justify-between hover:bg-white/[0.04] transition text-left">
                    <div
                      onClick={() => setActiveTab('theme')}
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                    >
                      <div className={`p-2.5 rounded-xl border shrink-0 transition ${
                        localPowerSaving
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-amber-500/15 text-amber-400 border-amber-500/25'
                      }`}>
                        <BatteryCharging className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-white text-xs block truncate">
                          Mode d'Économie d'Énergie
                        </span>
                        <span className="text-[10px] text-white/50 block truncate">
                          {localPowerSaving
                            ? `Actif • Animations 30 Hz & Pause IA (${localThresholdMins === 0 ? 'Immédiate' : `${localThresholdMins} min`})`
                            : 'Réduit le rafraîchissement & met en pause l’IA en session longue'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTogglePowerSave(!localPowerSaving)}
                      className={`w-11 h-6 rounded-full p-1 transition-colors relative shrink-0 ml-2 cursor-pointer ${
                        localPowerSaving ? 'bg-[#22c55e]' : 'bg-zinc-800'
                      }`}
                      title={localPowerSaving ? "Désactiver l'économie d'énergie" : "Activer l'économie d'énergie"}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          localPowerSaving ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Logout Button inside Profile settings */}
              {onLogout && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onLogout();
                    }}
                    className="w-full py-3 px-4 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 font-extrabold text-xs flex items-center justify-center gap-2 transition active:scale-95"
                  >
                    <LogOut className="w-4 h-4" />
                    Se déconnecter de mon compte
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'theme' && (
            <>
              {/* Sélecteur Thème Sombre / Thème Clair / Système en 1 clic */}
              <div>
                <label className="text-xs font-bold text-white mb-2.5 block flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  Apparence de l'application (Activation en 1 clic)
                </label>

                <div className="grid grid-cols-3 gap-2.5">
                  {/* 1. Thème Sombre */}
                  <button
                    type="button"
                    onClick={() => applyThemeImmediately('black')}
                    className={`p-3.5 rounded-2xl border text-left transition relative active:scale-95 flex flex-col justify-between cursor-pointer ${
                      selectedTheme !== 'light' && selectedTheme !== 'system'
                        ? 'bg-gradient-to-br from-purple-950 to-zinc-900 border-purple-500 ring-2 ring-purple-500/80 text-white shadow-lg'
                        : 'bg-zinc-900/70 border-white/10 text-white/70 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                        <Moon className="w-4 h-4" />
                      </div>
                      {selectedTheme !== 'light' && selectedTheme !== 'system' && (
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]" />
                      )}
                    </div>
                    <div>
                      <span className="font-extrabold text-xs block text-white leading-tight">Thème Sombre</span>
                      <span className="text-[10px] text-white/50 block mt-0.5 leading-tight">Noir OLED</span>
                    </div>
                  </button>

                  {/* 2. Thème Clair */}
                  <button
                    type="button"
                    onClick={() => applyThemeImmediately('light')}
                    className={`p-3.5 rounded-2xl border text-left transition relative active:scale-95 flex flex-col justify-between cursor-pointer ${
                      selectedTheme === 'light'
                        ? 'bg-gradient-to-br from-amber-500/20 to-zinc-900 border-amber-400 ring-2 ring-amber-400/80 text-white shadow-lg'
                        : 'bg-zinc-900/70 border-white/10 text-white/70 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
                        <Sun className="w-4 h-4" />
                      </div>
                      {selectedTheme === 'light' && (
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
                      )}
                    </div>
                    <div>
                      <span className="font-extrabold text-xs block text-white leading-tight">Thème Clair</span>
                      <span className="text-[10px] text-white/50 block mt-0.5 leading-tight">Lumineux</span>
                    </div>
                  </button>

                  {/* 3. Option Système (prefers-color-scheme dynamique en temps réel) */}
                  <button
                    type="button"
                    onClick={() => applyThemeImmediately('system')}
                    className={`p-3.5 rounded-2xl border text-left transition relative active:scale-95 flex flex-col justify-between cursor-pointer ${
                      selectedTheme === 'system'
                        ? 'bg-gradient-to-br from-blue-950 to-zinc-900 border-blue-400 ring-2 ring-blue-500/80 text-white shadow-lg'
                        : 'bg-zinc-900/70 border-white/10 text-white/70 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <Laptop className="w-4 h-4" />
                      </div>
                      {selectedTheme === 'system' && (
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_8px_#3b82f6]" />
                      )}
                    </div>
                    <div>
                      <span className="font-extrabold text-xs block text-white leading-tight">Système</span>
                      <span className="text-[10px] text-white/50 block mt-0.5 leading-tight">Automatique</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Statut en temps réel de l'option Système (prefers-color-scheme) */}
              {selectedTheme === 'system' && (
                <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/30 flex items-start gap-3">
                  <Laptop className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-white text-xs block">
                        Synchronisation Système en temps réel
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                        {systemPrefersDark ? '🌙 OS Sombre détecté' : '☀️ OS Clair détecté'}
                      </span>
                    </div>
                    <p className="text-[10px] text-white/70 mt-1 leading-snug">
                      Détecte automatiquement la préférence de votre appareil (<code>prefers-color-scheme</code>) et ajuste le thème de l'application dynamiquement en temps réel.
                    </p>
                  </div>
                </div>
              )}

              {/* Confirmation et sauvegarde du thème */}
              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-white/15 space-y-3 shadow-xl">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[#25F4EE]" />
                    <span className="font-extrabold text-white">Thème actif</span>
                  </div>
                  <span className="text-[11px] font-bold text-white/90 bg-white/10 px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        selectedTheme === 'light'
                          ? 'bg-amber-400'
                          : selectedTheme === 'system'
                          ? 'bg-blue-400'
                          : 'bg-purple-400'
                      }`}
                    />
                    {selectedTheme === 'light'
                      ? 'Thème Clair'
                      : selectedTheme === 'system'
                      ? `Système (${systemPrefersDark ? 'Sombre' : 'Clair'})`
                      : 'Thème Sombre'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => applyThemeImmediately(selectedTheme)}
                  data-keep-white="true"
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:brightness-110 text-black font-black text-xs tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Enregistrer le thème</span>
                </button>

                {themeSaveSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center gap-2 text-emerald-500 text-xs font-bold shadow-md animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                    <span>✓ Thème appliqué et enregistré immédiatement !</span>
                  </div>
                )}
              </div>

              {/* Data Saver / Autoplay Setting */}
              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-white/5 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${autoplayEnabled ? 'bg-[#25F4EE]/20 text-[#25F4EE]' : 'bg-zinc-800 text-white/50'}`}>
                    <Wifi className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white text-xs block">Lecture automatique (Autoplay)</span>
                    <p className="text-[11px] text-white/50 mt-0.5 leading-snug">
                      Désactivez cette option pour économiser vos données mobiles. Les vidéos ne se lanceront qu'après un appui.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleAutoplay(!autoplayEnabled)}
                  className={`w-11 h-6 rounded-full p-1 transition-colors relative shrink-0 mt-1 ${
                    autoplayEnabled ? 'bg-[#22c55e]' : 'bg-zinc-800'
                  }`}
                  title={autoplayEnabled ? 'Désactiver Autoplay' : 'Activer Autoplay'}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      autoplayEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Mode d'Économie d'Énergie & Pause IA Prolongée */}
              <div className={`p-4 rounded-2xl border space-y-3 transition ${
                localPowerSaving
                  ? 'bg-emerald-950/40 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                  : 'bg-zinc-900 border-white/10'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      localPowerSaving ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-amber-400'
                    }`}>
                      <BatteryCharging className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-white text-xs">Mode d'Économie d'Énergie</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                          localPowerSaving
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-white/5 text-white/50 border-white/10'
                        }`}>
                          {localPowerSaving ? '30 Hz Éco Actif' : '60/120 Hz Standard'}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/60 mt-1 leading-snug">
                        Réduit la fréquence de rafraîchissement des animations, désactive les flous GPU gourmands et met en pause l'IA de recommandation lors des sessions de visionnage prolongées.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTogglePowerSave(!localPowerSaving)}
                    className={`w-11 h-6 rounded-full p-1 transition-colors relative shrink-0 mt-1 cursor-pointer ${
                      localPowerSaving ? 'bg-[#22c55e]' : 'bg-zinc-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        localPowerSaving ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Réglage du seuil de session prolongée pour la pause IA */}
                <div className="pt-2 border-t border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-white/80 font-bold flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-[#25F4EE]" />
                      Pause automatique de l'IA après :
                    </span>
                    <span className="text-[10px] font-bold text-[#25F4EE]">
                      Session actuelle : {sessionWatchMinutes} min
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { mins: 0, label: 'Immédiat' },
                      { mins: 15, label: '15 min' },
                      { mins: 30, label: '30 min' },
                      { mins: 60, label: '60 min' },
                    ].map((opt) => (
                      <button
                        key={opt.mins}
                        type="button"
                        onClick={() => handleChangeThreshold(opt.mins)}
                        className={`py-1.5 px-2 rounded-xl text-[10px] font-extrabold border transition cursor-pointer ${
                          localThresholdMins === opt.mins
                            ? 'bg-[#25F4EE]/20 border-[#25F4EE] text-[#25F4EE]'
                            : 'bg-zinc-950/60 border-white/10 text-white/60 hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Replay Splash Screen Button */}
              <div className="pt-3 border-t border-white/10">
                <button
                  onClick={() => {
                    onClose();
                    onReplaySplash();
                  }}
                  className="w-full py-2.5 px-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#25F4EE]" />
                  Rejouer l'animation de démarrage TokVibe
                </button>
              </div>
            </>
          )}

          {activeTab === 'ai' && (
            <>
              {/* Bannière Mode Économie d'Énergie & Pause IA lors des sessions prolongées */}
              <div className={`p-3.5 rounded-2xl border flex flex-col gap-2.5 ${
                effectiveAiPaused
                  ? 'bg-amber-950/40 border-amber-500/40'
                  : localPowerSaving
                  ? 'bg-emerald-950/40 border-emerald-500/30'
                  : 'bg-zinc-900/80 border-white/10'
              }`}>
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5">
                    <div className={`p-2 rounded-xl shrink-0 ${
                      effectiveAiPaused ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {effectiveAiPaused ? <PauseCircle className="w-4 h-4" /> : <BatteryCharging className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="font-extrabold text-white text-xs block">
                        {effectiveAiPaused
                          ? 'IA de Recommandation en Pause (Économie d’Énergie)'
                          : 'Protection Batterie — Sessions de Visionnage Prolongées'}
                      </span>
                      <p className="text-[10px] text-white/60 mt-0.5 leading-snug">
                        {effectiveAiPaused
                          ? 'Le recalcul dynamique du flux est mis en pause pour préserver la batterie et réduire la chauffe processeur.'
                          : `En mode économie d'énergie, l'algorithme IA se met automatiquement en pause après ${localThresholdMins === 0 ? 'activation immédiate' : `${localThresholdMins} min de visionnage`}.`}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTogglePowerSave(!localPowerSaving)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-black border shrink-0 transition cursor-pointer ${
                      localPowerSaving
                        ? 'bg-emerald-500 text-black border-emerald-400'
                        : 'bg-zinc-800 text-white/70 border-white/10 hover:text-white'
                    }`}
                  >
                    {localPowerSaving ? 'Éco Actif' : 'Activer Éco'}
                  </button>
                </div>

                {localPowerSaving && !effectiveAiPaused && onSimulateProlongedSession && (
                  <button
                    type="button"
                    onClick={onSimulateProlongedSession}
                    className="w-full py-1.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[10px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <PauseCircle className="w-3.5 h-3.5" />
                    Simuler une session prolongée ({localThresholdMins || 15} min) et mettre l'IA en pause maintenant
                  </button>
                )}
              </div>

              {/* AI Vibe Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Ambiance de Recommandation IA
                  </label>
                  <span className={`text-[10px] font-semibold flex items-center gap-1 ${
                    effectiveAiPaused ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {effectiveAiPaused ? (
                      <>
                        <PauseCircle className="w-3 h-3" />
                        IA en Pause (Mode Éco)
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-3 h-3" />
                        Algorithme V4.2 Actif
                      </>
                    )}
                  </span>
                </div>
                <div className="space-y-2">
                  {[
                    { id: 'balanced', label: 'Équilibré TikFlow IA', desc: 'Mix optimal de tendances, musiques et créateurs émergents.' },
                    { id: 'viral', label: 'Tendances Virales & Buzz', desc: 'Priorité absolue aux vidéos à fort taux de partage et sons viraux.' },
                    { id: 'tech', label: 'High-Tech, Dev & Futur', desc: 'Concentration sur les innovations, IA, gadgets et tutoriels code.' },
                    { id: 'creative', label: 'Art, Danse & Musique', desc: 'Chorégraphies rythmées, créativité visuelle et latte art.' },
                    { id: 'chill', label: 'Détente & Minimalisme', desc: 'Vidéos apaisantes, nature, couchers de soleil et sons lo-fi.' },
                  ].map((vibe) => (
                    <button
                      key={vibe.id}
                      onClick={() => {
                        const updated = { ...localAiPrefs, vibe: vibe.id as any };
                        setLocalAiPrefs(updated);
                        onUpdateAiPrefs(updated);
                      }}
                      className={`w-full p-3 rounded-2xl border text-left transition active:scale-98 ${
                        localAiPrefs.vibe === vibe.id
                          ? 'bg-gradient-to-r from-zinc-900 to-zinc-850 border-[#25F4EE]/60 ring-1 ring-[#25F4EE]'
                          : 'bg-zinc-900/60 border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{vibe.label}</span>
                        {localAiPrefs.vibe === vibe.id && (
                          <span className="w-2 h-2 rounded-full bg-[#25F4EE]" />
                        )}
                      </div>
                      <p className="text-[10px] text-white/50 mt-1">{vibe.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Weight Sliders */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-white/5 space-y-3">
                <span className="text-xs font-bold text-white block">Pondération dynamique</span>
                <div>
                  <div className="flex justify-between text-[11px] text-white/70 mb-1">
                    <span>Humour & Danse</span>
                    <span className="text-[#FE2C55] font-bold">{localAiPrefs.humorWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={localAiPrefs.humorWeight}
                    onChange={(e) => {
                      const u = { ...localAiPrefs, humorWeight: Number(e.target.value) };
                      setLocalAiPrefs(u);
                      onUpdateAiPrefs(u);
                    }}
                    className="w-full accent-[#FE2C55]"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-white/70 mb-1">
                    <span>Tech & Futurisme</span>
                    <span className="text-[#25F4EE] font-bold">{localAiPrefs.techWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={localAiPrefs.techWeight}
                    onChange={(e) => {
                      const u = { ...localAiPrefs, techWeight: Number(e.target.value) };
                      setLocalAiPrefs(u);
                      onUpdateAiPrefs(u);
                    }}
                    className="w-full accent-[#25F4EE]"
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'lang' && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-white block flex items-center justify-between">
                <span>Sélectionnez votre langue d'affichage</span>
                <span className="text-[10px] text-[#25F4EE] font-semibold">{languages.length} langues</span>
              </label>

              {/* Search Filter for Languages */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher une langue..."
                  value={langSearch}
                  onChange={(e) => setLangSearch(e.target.value)}
                  className="w-full py-2 pl-9 pr-3 rounded-xl bg-zinc-900 border border-white/10 text-white text-xs placeholder-white/40 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-2 max-h-[45vh] overflow-y-auto no-scrollbar pr-0.5">
                {filteredLanguages.length === 0 ? (
                  <p className="text-center text-white/40 py-4 text-xs">Aucune langue trouvée</p>
                ) : (
                  filteredLanguages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => onUpdateLanguage(l.code)}
                      className={`w-full p-3 rounded-2xl border flex items-center justify-between transition active:scale-95 ${
                        currentLanguage === l.code
                          ? 'bg-gradient-to-r from-purple-950/80 to-zinc-900 border-purple-500 ring-1 ring-purple-500'
                          : 'bg-zinc-900/60 border-white/5 hover:bg-zinc-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{l.flag}</span>
                        <div className="text-left">
                          <span className="font-bold text-white text-xs block">{l.label}</span>
                          <span className="text-[10px] text-white/50 block">{l.nativeLabel}</span>
                        </div>
                      </div>
                      {currentLanguage === l.code && (
                        <Check className="w-4 h-4 text-purple-400 stroke-[3]" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'verification' && (
            <div className="space-y-4 text-left">
              {/* Header Banner with 3D Badge Preview */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/90 via-zinc-900 to-black border-2 border-emerald-500/50 shadow-[0_0_20px_rgba(34,197,94,0.25)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center gap-2 mb-2">
                  <span className="p-1.5 rounded-xl bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30 shadow-[0_0_12px_rgba(34,197,94,0.4)]">
                    <ShieldCheck className="w-5 h-5 text-[#22c55e]" />
                  </span>
                  <div>
                    <h4 className="text-xs font-black text-white tracking-wide uppercase flex items-center gap-1.5">
                      Vérification Officielle — Crochet Vert 3D
                      <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping" />
                    </h4>
                    <p className="text-[10px] text-emerald-400 font-semibold">Validation d'identité officielle et condition d'âge</p>
                  </div>
                </div>

                {/* Live Preview Card */}
                <div className="mt-3 p-3 rounded-xl bg-black/70 border border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={currentUser?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full object-cover border-2 border-[#22c55e]"
                    />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-extrabold text-white text-xs">
                          {currentUser?.displayName || 'Votre Compte'}
                        </span>
                        {isVerifiedLocal && (
                          <span
                            className="relative inline-flex items-center justify-center w-5 h-5 rounded-full shadow-[0_0_12px_#22c55e,inset_0_2px_4px_rgba(255,255,255,0.85),inset_0_-2px_4px_rgba(0,0,0,0.5)] border border-emerald-300 shrink-0"
                            style={{
                              background: 'radial-gradient(circle at 35% 35%, #86efac 0%, #22c55e 50%, #15803d 85%, #052e16 100%)',
                            }}
                            title="Badge officiel Boule Verte 3D"
                          >
                            <span className="absolute top-0.5 left-1 w-1.5 h-1.5 rounded-full bg-white blur-[0.2px] pointer-events-none" />
                            <Check className="w-3 h-3 stroke-[4] text-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]" />
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-white/50">@{currentUser?.handle || 'votre_pseudo'}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                    isVerifiedLocal
                      ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/40 shadow-[0_0_8px_rgba(34,197,94,0.4)]'
                      : 'bg-zinc-800 text-white/50'
                  }`}>
                    {isVerifiedLocal && (
                      <span className="w-2 h-2 rounded-full bg-[#22c55e] shadow-[0_0_6px_#22c55e]" />
                    )}
                    {isVerifiedLocal ? 'Compte Certifié' : 'Non Vérifié'}
                  </span>
                </div>
              </div>

              {/* Strict Verification Conditions Rules Box */}
              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs space-y-2">
                <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-[11px] uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Conditions Strictes d'Éligibilité (Obligatoires)</span>
                </div>
                <ul className="space-y-1 text-[11px] text-amber-100/90 pl-1">
                  <li className="flex items-start gap-1.5">
                    <span className="font-extrabold text-amber-400">1.</span>
                    <span><strong>Âge minimum de 18 ans :</strong> L'utilisateur doit impérativement avoir 18 ans révolus (vérifié via la date de naissance).</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="font-extrabold text-amber-400">2.</span>
                    <span><strong>Pièce d'identité d'origine :</strong> Fournir une pièce officielle valide émise par le <strong>pays d'origine de création du compte</strong>.</span>
                  </li>
                </ul>
              </div>

              {/* Verification Success Toast */}
              {verificationSuccess && (
                <div className="p-3.5 rounded-2xl bg-emerald-950 border border-emerald-500/80 text-emerald-200 text-xs flex items-center gap-2.5 animate-pulse shadow-lg">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-extrabold text-white block">Vérification approuvée avec succès !</span>
                    <span className="text-[10px] text-emerald-300">
                      Votre compte bénéficie désormais du crochet vert 3D certifié officiel.
                    </span>
                  </div>
                </div>
              )}

              {/* Verification Error Toast */}
              {verificationError && (
                <div className="p-3.5 rounded-2xl bg-rose-950/90 border border-rose-500/80 text-rose-200 text-xs flex items-start gap-2.5 shadow-lg">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-white block">Accès à la vérification refusé</span>
                    <span className="text-[11px] text-rose-200/90 leading-tight block mt-0.5">
                      {verificationError}
                    </span>
                  </div>
                </div>
              )}

              {/* Strict Verification Submission Form (Only if not verified/pending) */}
              {verificationStatusLocal === 'none' || verificationStatusLocal === 'rejected' ? (
                <form onSubmit={handleVerifySubmit} className="space-y-3.5 bg-zinc-900/80 p-4 rounded-2xl border border-white/10">
                  <span className="text-xs font-black text-white block pb-1 border-b border-white/10 uppercase tracking-wider">
                    Formulaire de Demande de Certification
                  </span>
                  
                  {/* ... same fields as before ... */}
                  {/* ... reusing existing field logic ... */}
                  
                  {/* Field 1: Date of Birth (+18 Check) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-white font-bold text-xs flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#25F4EE]" />
                        1. Date de Naissance (18 ans minimum)
                      </label>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                        calculateAge(birthDate) >= 18
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40'
                          : 'bg-rose-950 text-rose-400 border-rose-500/40'
                      }`}>
                        {birthDate ? `${calculateAge(birthDate)} ans (${calculateAge(birthDate) >= 18 ? 'Éligible +18' : 'Non éligible -18'})` : 'Date requise'}
                      </span>
                    </div>

                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => {
                        setBirthDate(e.target.value);
                        setVerificationError(null);
                      }}
                      className={`w-full p-2.5 rounded-xl bg-zinc-950 border text-white text-xs focus:outline-none ${
                        calculateAge(birthDate) >= 18
                          ? 'border-emerald-500/50 focus:ring-1 focus:ring-emerald-500'
                          : 'border-rose-500/80 focus:ring-1 focus:ring-rose-500'
                      }`}
                    />
                    {calculateAge(birthDate) < 18 && (
                      <p className="text-[10px] text-rose-400 font-bold mt-1">
                        ⚠️ Les utilisateurs âgés de moins de 18 ans ne peuvent pas prétendre à la certification.
                      </p>
                    )}
                  </div>

                  {/* Field 2: Country of Origin of Account Creation */}
                  <div>
                    <label className="text-white font-bold text-xs block mb-1">
                      2. Pays d'origine de création du compte
                    </label>
                    <select
                      value={idCountry}
                      onChange={(e) => setIdCountry(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white text-xs focus:outline-none focus:border-[#25F4EE]"
                    >
                      <option value="France">🇫🇷 France</option>
                      <option value="Côte d'Ivoire">🇨🇮 Côte d'Ivoire</option>
                      <option value="Sénégal">🇸🇳 Sénégal</option>
                      <option value="Haïti">🇭🇹 Haïti</option>
                      <option value="Cameroun">🇨🇲 Cameroun</option>
                      <option value="République Démocratique du Congo">🇨🇩 R.D. Congo</option>
                      <option value="Canada">🇨🇦 Canada</option>
                      <option value="Belgique">🇧🇪 Belgique</option>
                      <option value="Suisse">🇨🇭 Suisse</option>
                      <option value="Maroc">🇲🇦 Maroc</option>
                      <option value="Algérie">🇩🇿 Algérie</option>
                      <option value="Tunisie">🇹🇳 Tunisie</option>
                      <option value="Madagascar">🇲🇬 Madagascar</option>
                      <option value="États-Unis">🇺🇸 États-Unis</option>
                      <option value="Autre pays">🌍 Autre pays d'origine</option>
                    </select>
                    <p className="text-[9px] text-white/40 mt-1">
                      La pièce d'identité fournie doit être émise par l'autorité officielle de ce pays d'origine.
                    </p>
                  </div>

                  {/* Field 3: ID Document Type */}
                  <div>
                    <label className="text-white font-bold text-xs block mb-1">
                      3. Type de pièce d'identité officielle
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'id_card', name: 'Carte d\'identité' },
                        { id: 'passport', name: 'Passeport' },
                        { id: 'driver_license', name: 'Permis conduire' },
                      ].map((doc) => (
                        <button
                          type="button"
                          key={doc.id}
                          onClick={() => setIdType(doc.id as any)}
                          className={`p-2 rounded-xl border text-[11px] font-extrabold transition active:scale-95 ${
                            idType === doc.id
                              ? 'bg-[#25F4EE]/15 border-[#25F4EE] text-[#25F4EE]'
                              : 'bg-zinc-950 border-white/10 text-white/60 hover:text-white'
                          }`}
                        >
                          {doc.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Field 4: Document File Upload (Real - Front & Back) */}
                  <div className="space-y-3">
                    <label className="text-white font-bold text-xs block">
                      4. Téléversement de la pièce d'identité officielle
                    </label>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {/* Front Side */}
                      <div className="space-y-1.5">
                        <input
                          type="file"
                          ref={frontFileInputRef}
                          onChange={handleFrontUpload}
                          accept="image/jpeg,image/png,application/pdf"
                          className="hidden"
                        />
                        <div
                          onClick={() => frontFileInputRef.current?.click()}
                          className={`p-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                            idFrontUploaded 
                              ? 'border-emerald-500 bg-emerald-950/20' 
                              : 'border-white/10 bg-zinc-950 hover:border-[#25F4EE]'
                          }`}
                        >
                          {idFrontUploaded ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Upload className="w-5 h-5 text-white/20" />
                          )}
                          <span className="text-[10px] font-bold text-white">Recto (Face)</span>
                        </div>
                      </div>

                      {/* Back Side */}
                      <div className="space-y-1.5">
                        <input
                          type="file"
                          ref={backFileInputRef}
                          onChange={handleBackUpload}
                          accept="image/jpeg,image/png,application/pdf"
                          className="hidden"
                        />
                        <div
                          onClick={() => backFileInputRef.current?.click()}
                          className={`p-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                            idBackUploaded 
                              ? 'border-emerald-500 bg-emerald-950/20' 
                              : 'border-white/10 bg-zinc-950 hover:border-[#25F4EE]'
                          }`}
                        >
                          {idBackUploaded ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Upload className="w-5 h-5 text-white/20" />
                          )}
                          <span className="text-[10px] font-bold text-white">Verso (Dos)</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-[9px] text-white/40 text-center italic">
                      Formats: JPG, PNG, PDF — Scan sécurisé conforme RGPD
                    </p>
                  </div>

                  {/* Field 5: Terms Checkbox */}
                  <div className="flex items-start gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="terms-check"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 accent-[#22c55e] w-4 h-4 rounded"
                    />
                    <label htmlFor="terms-check" className="text-[10px] text-white/80 leading-tight cursor-pointer">
                      Je certifie sous peine de désactivation permanente du compte que j'ai au moins <strong>18 ans révolus</strong> et que ma pièce d'identité est authentique et valide.
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 active:scale-95 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 text-black shadow-[0_0_18px_rgba(34,197,94,0.7)] hover:brightness-110"
                  >
                    <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                    Envoyer ma demande de certification
                  </button>
                </form>
              ) : verificationStatusLocal === 'pending' ? (
                <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)] border border-amber-500/50">
                    <Clock className="w-8 h-8 text-amber-500 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">Vérification en cours</h3>
                    <p className="text-[11px] text-white/70 mt-1 max-w-xs leading-relaxed">
                      Vos documents ont été envoyés avec succès. Notre équipe examine actuellement votre demande.
                    </p>
                    <div className="mt-4 p-2.5 rounded-xl bg-black/40 border border-amber-500/20 text-[10px] text-amber-200/90 font-bold">
                      Délai d'attente estimé : 2 à 3 jours ouvrés.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-[#22c55e]/10 border border-[#22c55e]/30 flex flex-col items-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-[#22c55e] flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                    <Check className="w-8 h-8 stroke-[4] text-black" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">Compte Officiellement Certifié</h3>
                    <p className="text-[11px] text-white/60 mt-1 max-w-xs">
                      Votre identité a été validée par l'administration TokVibe. Seul un administrateur peut modifier ou révoquer votre badge vert 3D.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Floating Quick Theme Toggle Button (Bascule instantanée Thème Sombre / Clair) */}
        <div className="absolute bottom-4 right-4 z-40">
          <button
            type="button"
            onClick={handleQuickThemeToggle}
            data-keep-dark={isLightModeActive ? 'true' : undefined}
            data-keep-white={isLightModeActive ? 'true' : undefined}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.6)] border transition-all duration-200 active:scale-90 hover:scale-105 cursor-pointer backdrop-blur-xl ${
              isLightModeActive
                ? 'bg-zinc-900/95 text-white border-white/20 hover:bg-zinc-800 ring-2 ring-purple-500/50'
                : 'bg-white/95 text-zinc-950 border-amber-400/40 hover:bg-white ring-2 ring-amber-400/50'
            }`}
            title={isLightModeActive ? 'Basculer en Mode Sombre' : 'Basculer en Mode Clair'}
          >
            {isLightModeActive ? (
              <>
                <Moon className="w-4 h-4 text-purple-400 fill-purple-400" />
                <span data-keep-white="true" className="text-xs font-black tracking-tight text-white">Mode Sombre</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span className="text-xs font-black tracking-tight text-zinc-900">Mode Clair</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
