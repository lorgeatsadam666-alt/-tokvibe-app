import React, { useEffect, useState } from 'react';
import {
  Download,
  Smartphone,
  Tablet,
  CheckCircle2,
  Share,
  PlusSquare,
  X,
  Copy,
  Check,
  ExternalLink,
  Code2,
  FolderGit2,
  Loader2,
  Lock,
  Globe2,
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const OFFICIAL_APP_URL =
  typeof window !== 'undefined'
    ? window.location.origin
    : 'https://ais-pre-hb2voqkpbckco4qm6gifke-253683269122.us-east1.run.app';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deviceBrandLabel, setDeviceBrandLabel] = useState('Téléphone / Tablette Universel');

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIOSDevice);

    if (/iphone/.test(ua)) setDeviceBrandLabel('Apple iPhone (iOS)');
    else if (/ipad/.test(ua)) setDeviceBrandLabel('Apple iPad (iPadOS)');
    else if (/macintosh/.test(ua)) setDeviceBrandLabel('Apple Mac / iPadOS');
    else if (/samsung|sm-/.test(ua)) setDeviceBrandLabel('Samsung Galaxy (Android)');
    else if (/xiaomi|redmi|poco|mi /.test(ua)) setDeviceBrandLabel('Xiaomi / Redmi / Poco (Android)');
    else if (/huawei|harmonyos|honor/.test(ua)) setDeviceBrandLabel('Huawei / Honor (HarmonyOS / Android)');
    else if (/tecno|infinix|itel/.test(ua)) setDeviceBrandLabel('Tecno / Infinix / Itel (Android)');
    else if (/oppo|vivo|realme|oneplus/.test(ua)) setDeviceBrandLabel('Oppo / Vivo / Realme / OnePlus');
    else if (/pixel/.test(ua)) setDeviceBrandLabel('Google Pixel (Android)');
    else if (/android/.test(ua)) setDeviceBrandLabel('Appareil Android / Tablette Universelle');
    else setDeviceBrandLabel('Appareil Mobile / Tablette / Universel');

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    deviceBrandLabel,
    install,
  };
}

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, deviceBrandLabel, install } = usePWAInstall();
  const [showUniversalGuide, setShowUniversalGuide] = useState(false);
  const [showGitHubModal, setShowGitHubModal] = useState(false);

  // GitHub direct API push state
  const [repoName, setRepoName] = useState('tokvibe-app');
  const [repoDescription, setRepoDescription] = useState(
    'Application TokVibe — Flux vidéo court, Créateur Studio Haïti, Sécurité Biométrique & PWA'
  );
  const [isPrivateRepo, setIsPrivateRepo] = useState(false);
  const [githubToken, setGithubToken] = useState('');
  const [githubStatus, setGithubStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [githubMessage, setGithubMessage] = useState('');
  const [createdRepoUrl, setCreatedRepoUrl] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedGitCmd, setCopiedGitCmd] = useState(false);

  const handleInstallClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) return;
    }
    setShowUniversalGuide(true);
  };

  const handleCopyAppUrl = () => {
    navigator.clipboard.writeText(OFFICIAL_APP_URL);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const gitCommands = `git init
git add .
git commit -m "Initial commit: TokVibe App"
git branch -M main
git remote add origin https://github.com/VOTRE_COMPTE/${repoName || 'tokvibe-app'}.git
git push -u origin main`;

  const handleCopyGitCommands = () => {
    navigator.clipboard.writeText(gitCommands);
    setCopiedGitCmd(true);
    setTimeout(() => setCopiedGitCmd(false), 2500);
  };

  const handleCreateGitHubRepo = async () => {
    if (!githubToken.trim()) {
      setGithubStatus('error');
      setGithubMessage(
        'Veuillez entrer votre jeton GitHub (Personal Access Token) pour créer automatiquement le dépôt sur votre compte.'
      );
      return;
    }

    setGithubStatus('loading');
    setGithubMessage('');

    try {
      // 1. Create repository on user's GitHub account
      const createRes = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${githubToken.trim()}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: repoName.trim() || 'tokvibe-app',
          description: repoDescription,
          private: isPrivateRepo,
          auto_init: true,
        }),
      });

      const repoData = await createRes.json();

      if (!createRes.ok) {
        throw new Error(repoData?.message || 'Erreur lors de la création du dépôt GitHub.');
      }

      const fullName = repoData.full_name;
      const htmlUrl = repoData.html_url;

      // 2. Push official TokVibe README & deployment manifest to the newly created repo
      const readmeContent = `# ${repoName.trim() || 'TokVibe App'}\n\n${repoDescription}\n\n## Lien Officiel de l'Application (PWA Mobile & Desktop)\n- **Application en direct** : [${OFFICIAL_APP_URL}](${OFFICIAL_APP_URL})\n\n## Fonctionnalités principales\n- Navigation gestuelle avancée (Swipe droite vers profil auteur, Swipe gauche retour au flux)\n- Programme de Monétisation TikVibe (Exclusif Haïti 🇭🇹 & Irréversible une fois activé)\n- Verrouillage Biométrique & Face ID en direct (Caméra frontale + Capteur d'empreinte WebAuthn)\n- Regroupement intelligent des notifications dans la Boîte de réception (J'aime, Commentaires, Suivi)\n- Mode d'Économie d'Énergie (Animations 30 Hz + Pause automatique de l'IA en session prolongée)\n`;

      const encodedReadme = btoa(unescape(encodeURIComponent(readmeContent)));

      // Check if README.md exists from auto_init to get its sha
      const existingReadme = await fetch(`https://api.github.com/repos/${fullName}/contents/README.md`, {
        headers: {
          Authorization: `Bearer ${githubToken.trim()}`,
          Accept: 'application/vnd.github+json',
        },
      });
      const existingData = existingReadme.ok ? await existingReadme.json() : null;

      await fetch(`https://api.github.com/repos/${fullName}/contents/README.md`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${githubToken.trim()}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Ajout de la documentation et du lien officiel TokVibe',
          content: encodedReadme,
          ...(existingData?.sha ? { sha: existingData.sha } : {}),
        }),
      });

      setCreatedRepoUrl(htmlUrl);
      setGithubStatus('success');
      setGithubMessage(`Votre dépôt GitHub "${fullName}" a été créé et configuré avec succès !`);
    } catch (err: unknown) {
      setGithubStatus('error');
      setGithubMessage(
        err instanceof Error ? err.message : 'Impossible de contacter GitHub. Vérifiez votre token.'
      );
    }
  };

  return (
    <>
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border border-[#25F4EE]/40 space-y-2.5 shadow-lg">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-[#25F4EE]/15 text-[#25F4EE] border border-[#25F4EE]/30 shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="font-black text-white text-xs block truncate">
                Télécharger l&apos;App &amp; Exporter sur GitHub
              </span>
              <span className="text-[10px] text-[#25F4EE] font-semibold block truncate">
                Détecté : {deviceBrandLabel}
              </span>
            </div>
          </div>
          {isInstalled && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black shrink-0">
              Installée ✓
            </span>
          )}
        </div>

        <p className="text-[10px] text-white/60 leading-snug">
          Installez <strong>TokVibe</strong> sur <strong>Apple (iPhone, iPad)</strong> et <strong>Android (Samsung, Xiaomi, Tecno, Infinix, Huawei...)</strong> ou ajoutez directement votre application sur votre compte <strong>GitHub</strong>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {!isInstalled && (
            <button
              type="button"
              onClick={handleInstallClick}
              data-keep-white="true"
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#25F4EE] to-emerald-400 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>Télécharger l&apos;App</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowGitHubModal(true)}
            className="w-full py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-white/15 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
          >
            <FolderGit2 className="w-4 h-4 text-[#25F4EE] shrink-0" />
            <span>Ajouter sur GitHub</span>
          </button>
        </div>
      </div>

      {/* Modal: Ajouter / Exporter l'application sur GitHub & Lien de téléchargement */}
      {showGitHubModal && (
        <div
          className="fixed inset-0 z-[160] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto"
          onClick={() => setShowGitHubModal(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-zinc-950 border border-white/15 p-5 space-y-4 text-left shadow-2xl my-auto max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#25F4EE]/15 text-[#25F4EE] border border-[#25F4EE]/30">
                  <FolderGit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    Ajouter mon App TokVibe sur GitHub
                  </h3>
                  <p className="text-[10px] text-white/50">
                    Création automatique de dépôt GitHub ou synchronisation Git
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGitHubModal(false)}
                className="p-1.5 rounded-full bg-white/10 text-white/70 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Section 1: Lien direct de téléchargement de l'app */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-white/10 space-y-2">
              <span className="text-[11px] font-extrabold text-white flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-[#25F4EE]" />
                Lien Officiel de votre App (à partager aux utilisateurs)
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={OFFICIAL_APP_URL}
                  className="flex-1 bg-black/60 border border-white/10 rounded-xl px-2.5 py-2 text-[11px] text-white/80 font-mono outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyAppUrl}
                  className="px-3 py-2 rounded-xl bg-[#25F4EE]/20 hover:bg-[#25F4EE]/30 border border-[#25F4EE]/40 text-[#25F4EE] font-black text-[11px] flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copié !' : 'Copier'}</span>
                </button>
              </div>
            </div>

            {/* Section 2: Créer automatiquement le dépôt sur GitHub via API */}
            <div className="p-3.5 rounded-2xl bg-zinc-900 border border-[#25F4EE]/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <FolderGit2 className="w-4 h-4 text-emerald-400" />
                  1. Créer votre dépôt GitHub en 1 clic
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  API GitHub Directe
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-[10px] font-bold text-white/70 block mb-1">
                    Nom du dépôt GitHub
                  </label>
                  <input
                    type="text"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    placeholder="tokvibe-app"
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#25F4EE]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-white/70 block mb-1">
                    Description du projet
                  </label>
                  <input
                    type="text"
                    value={repoDescription}
                    onChange={(e) => setRepoDescription(e.target.value)}
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#25F4EE]"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-bold text-white/80 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    Visibilité du dépôt
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsPrivateRepo(false)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border cursor-pointer ${
                        !isPrivateRepo
                          ? 'bg-[#25F4EE]/20 border-[#25F4EE] text-[#25F4EE]'
                          : 'bg-zinc-950 border-white/10 text-white/50'
                      }`}
                    >
                      Public
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPrivateRepo(true)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border cursor-pointer ${
                        isPrivateRepo
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : 'bg-zinc-950 border-white/10 text-white/50'
                      }`}
                    >
                      Privé
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-bold text-white/70">
                      Jeton d&apos;accès GitHub (Personal Access Token)
                    </label>
                    <a
                      href="https://github.com/settings/tokens/new?scopes=repo&description=TokVibe+App"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-[#25F4EE] hover:underline flex items-center gap-0.5"
                    >
                      <span>Obtenir un token</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <input
                    type="password"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-[#25F4EE]"
                  />
                </div>

                <button
                  type="button"
                  disabled={githubStatus === 'loading'}
                  onClick={handleCreateGitHubRepo}
                  data-keep-white="true"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-[#25F4EE] text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition cursor-pointer disabled:opacity-50"
                >
                  {githubStatus === 'loading' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Création sur GitHub en cours...</span>
                    </>
                  ) : (
                    <>
                      <FolderGit2 className="w-4 h-4" />
                      <span>Créer &amp; Ajouter mon App sur GitHub</span>
                    </>
                  )}
                </button>

                {githubMessage && (
                  <div
                    className={`p-2.5 rounded-xl text-[11px] font-bold border ${
                      githubStatus === 'success'
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                    }`}
                  >
                    <p>{githubMessage}</p>
                    {createdRepoUrl && (
                      <a
                        href={createdRepoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1.5 inline-flex items-center gap-1 text-[#25F4EE] underline"
                      >
                        <span>Ouvrir mon dépôt sur GitHub</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Commandes Git prêtes à copier (dépôt Git déjà initialisé) */}
            <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-white flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-purple-400" />
                  2. Commandes Git (Dépôt local déjà initialisé ✓)
                </span>
                <button
                  type="button"
                  onClick={handleCopyGitCommands}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copiedGitCmd ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedGitCmd ? 'Copié' : 'Copier'}</span>
                </button>
              </div>
              <pre className="p-2.5 rounded-xl bg-black/80 border border-white/10 text-[10px] text-emerald-300 font-mono overflow-x-auto leading-relaxed">
                {gitCommands}
              </pre>
            </div>
          </div>
        </div>
      )}

      {showUniversalGuide && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          onClick={() => setShowUniversalGuide(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-zinc-950 border border-white/15 p-5 space-y-4 text-left shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tablet className="w-5 h-5 text-[#25F4EE]" />
                <h3 className="text-sm font-black text-white">
                  Installer TOKVIBE sur tout appareil
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowUniversalGuide(false)}
                className="p-1.5 rounded-full bg-white/10 text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Apple iPhone / iPad */}
              <div className="p-3 rounded-2xl bg-zinc-900 border border-white/10 space-y-1.5">
                <span className="font-black text-white flex items-center gap-1.5">
                  <Share className="w-3.5 h-3.5 text-[#25F4EE]" />
                  <span>1. Apple (iPhone, iPad &amp; iPod - Safari)</span>
                </span>
                <p className="text-[11px] text-white/65 leading-relaxed">
                  Appuyez sur le bouton <strong>Partager</strong> en bas de Safari, puis faites défiler et appuyez sur <strong>« Sur l&apos;écran d&apos;accueil »</strong> (<PlusSquare className="w-3 h-3 inline text-[#25F4EE]" />).
                </p>
              </div>

              {/* Android & Global Brands */}
              <div className="p-3 rounded-2xl bg-zinc-900 border border-white/10 space-y-1.5">
                <span className="font-black text-white flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>2. Android &amp; Toutes les Marques Mondiales</span>
                </span>
                <p className="text-[11px] text-white/65 leading-relaxed">
                  Sur <strong>Samsung, Xiaomi, Redmi, Huawei, Honor, Tecno, Infinix, Oppo, Vivo, Realme, Pixel, Motorola, Sony, Nokia, ZTE, TCL</strong> et toutes les autres marques : appuyez sur le menu <strong>⋮</strong> du navigateur puis sur <strong>« Installer l&apos;application »</strong> ou <strong>« Ajouter à l&apos;écran d&apos;accueil »</strong>.
                </p>
              </div>

              {/* Permissions reminder */}
              <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-2 text-[11px] text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Une fois installée, l&apos;interface s&apos;adapte automatiquement en plein écran aux téléphones et tablettes avec accès complet au <strong>Micro, Caméra, Localisation, Galerie et Stockage</strong>.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowUniversalGuide(false)}
              data-keep-white="true"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FE2C55] to-[#25F4EE] text-white font-black text-xs text-center shadow-lg cursor-pointer"
            >
              Compris
            </button>
          </div>
        </div>
      )}
    </>
  );
};
