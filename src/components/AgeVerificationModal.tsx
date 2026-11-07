import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  Calendar,
  Upload,
  CheckCircle2,
  AlertTriangle,
  LogOut,
} from 'lucide-react';
import { UserProfile } from '../types';

interface AgeVerificationModalProps {
  currentUser: UserProfile;
  onComplete: (data: { birthDate: string; idCountry: string; idType: string }) => void;
  onLogout: () => void;
}

export const AgeVerificationModal: React.FC<AgeVerificationModalProps> = ({
  currentUser,
  onComplete,
  onLogout,
}) => {
  const [birthDate, setBirthDate] = useState('');
  const [idCountry, setIdCountry] = useState(currentUser?.idCountry || '');
  const [idType, setIdType] = useState<'passport' | 'id_card' | 'driver_license'>('id_card');
  const [idFrontUploaded, setIdFrontUploaded] = useState(false);
  const [idBackUploaded, setIdBackUploaded] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const frontFileInputRef = useRef<HTMLInputElement>(null);
  const backFileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFrontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdFrontUploaded(true);
      setError(null);
    }
  };

  const handleBackUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdBackUploaded(true);
      setError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!idCountry.trim()) {
      setError("Veuillez obligatoirement sélectionner votre pays d'origine.");
      return;
    }

    if (!birthDate) {
      setError('Veuillez indiquer votre date de naissance.');
      return;
    }

    const age = calculateAge(birthDate);
    if (age < 18) {
      setError(`Accès refusé : Vous devez avoir au moins 18 ans pour utiliser TokVibe. (Âge détecté : ${age} ans).`);
      return;
    }

    if (!idFrontUploaded || !idBackUploaded) {
      setError('Veuillez téléverser le recto ET le verso de votre pièce d\'identité officielle.');
      return;
    }

    if (!agreedToTerms) {
      setError('Vous devez certifier l\'authenticité de vos informations.');
      return;
    }

    try {
      localStorage.setItem('tokvibe_user_country', idCountry);
    } catch {}
    onComplete({ birthDate, idCountry, idType });
  };

  const userAge = calculateAge(birthDate);

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-[32px] p-8 shadow-2xl space-y-6 my-auto">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#FE2C55] to-[#25F4EE] p-0.5 mx-auto mb-4">
            <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Vérification Requise</h2>
          <p className="text-sm text-white/60">
            Conformément à nos conditions de sécurité, vous devez confirmer votre âge et votre pays d'origine pour accéder à votre compte TokVibe.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 animate-shake">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <p className="text-xs text-rose-200 font-medium leading-relaxed">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Date de Naissance */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/70 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#25F4EE]" />
              Date de naissance (18+ obligatoire)
            </label>
            <input
              type="date"
              required
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className={`w-full bg-zinc-950 border p-4 rounded-2xl text-white text-sm focus:outline-none transition-all ${
                birthDate && userAge < 18 ? 'border-rose-500 ring-1 ring-rose-500' : 'border-white/10 focus:border-[#25F4EE]'
              }`}
            />
            {birthDate && (
              <p className={`text-[10px] font-bold ${userAge >= 18 ? 'text-emerald-400' : 'text-rose-400'}`}>
                Âge détecté : {userAge} ans {userAge >= 18 ? '(Éligible)' : '(Accès interdit aux mineurs)'}
              </p>
            )}
          </div>

          {/* Pays d'origine */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/70 block">Pays d'origine (Obligatoire) *</label>
            <select
              value={idCountry}
              onChange={(e) => setIdCountry(e.target.value)}
              required
              className="w-full bg-zinc-950 border border-white/10 p-4 rounded-2xl text-white text-sm focus:outline-none focus:border-[#25F4EE]"
            >
              <option value="">-- Sélectionnez votre pays d'origine --</option>
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
            {idCountry && (
              <p className="text-[10px] text-white/55">
                {idCountry === 'Haïti'
                  ? '🇭🇹 Haïti : votre compte aura accès au Programme de Monétisation TokVibe.'
                  : `🌍 ${idCountry} : le Programme de Monétisation est réservé uniquement au pays Haïti.`}
              </p>
            )}
          </div>

          {/* Document Upload (Front & Back) */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-white/70 block">Pièce d'identité officielle</label>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Front Side */}
              <div className="space-y-1.5">
                <input
                  type="file"
                  ref={frontFileInputRef}
                  onChange={handleFrontUpload}
                  accept="image/*,application/pdf"
                  className="hidden"
                />
                <div
                  onClick={() => frontFileInputRef.current?.click()}
                  className={`p-4 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                    idFrontUploaded 
                      ? 'border-emerald-500 bg-emerald-500/5' 
                      : 'border-white/10 bg-zinc-950 hover:border-[#25F4EE] hover:bg-white/5'
                  }`}
                >
                  {idFrontUploaded ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <Upload className="w-6 h-6 text-white/20" />
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
                  accept="image/*,application/pdf"
                  className="hidden"
                />
                <div
                  onClick={() => backFileInputRef.current?.click()}
                  className={`p-4 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                    idBackUploaded 
                      ? 'border-emerald-500 bg-emerald-500/5' 
                      : 'border-white/10 bg-zinc-950 hover:border-[#25F4EE] hover:bg-white/5'
                  }`}
                >
                  {idBackUploaded ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <Upload className="w-6 h-6 text-white/20" />
                  )}
                  <span className="text-[10px] font-bold text-white">Verso (Dos)</span>
                </div>
              </div>
            </div>
            <p className="text-[9px] text-white/40 text-center italic">
              Formats: JPG, PNG, PDF — Scan sécurisé conforme RGPD
            </p>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-3 py-2">
            <input
              type="checkbox"
              id="confirm-age"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 w-5 h-5 rounded-lg border-white/20 bg-zinc-950 accent-[#FE2C55]"
            />
            <label htmlFor="confirm-age" className="text-[11px] text-white/50 leading-relaxed cursor-pointer">
              Je certifie sur l'honneur avoir plus de 18 ans et que les documents fournis sont authentiques. TokVibe se réserve le droit de bannir tout compte frauduleux.
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#FE2C55] to-[#FF5C7E] py-4 rounded-2xl text-white font-black text-sm shadow-xl shadow-rose-500/20 active:scale-95 transition-all hover:brightness-110"
          >
            Valider et accéder à mon compte
          </button>
        </form>

        <button
          onClick={onLogout}
          className="w-full py-3 text-white/40 hover:text-white/60 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Se déconnecter
        </button>
      </div>
    </div>
  );
};
