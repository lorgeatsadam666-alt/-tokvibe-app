/**
 * Content Moderation & Safety Rules for TokVibe
 * 
 * Rules:
 * 1. Strictly forbid explicit sexual content, pornography, gratuitous violence, gore, hate speech, and illegal activities.
 * 2. Identify sports, stunts, martial arts, or dangerous actions and attach mandatory safety warnings ("Ne tentez pas ceci chez vous").
 */

// Prohibited content keywords (Regex pattern matching)
const PROHIBITED_SEXUAL_KEYWORDS = [
  'sexe', 'porn', 'porno', 'nude', 'nudite', 'nudité', 'nuit_intime',
  'hentai', 'xxx', 'erotic', 'erotique', 'striptease', 'sexuel', 'sexuelle'
];

const PROHIBITED_VIOLENCE_KEYWORDS = [
  'gore', 'suicide', 'meurtre', 'torture', 'mutilation', 'blood_splatter',
  'terrorisme', 'armement_illegal', 'haine_raciale', 'violences_gratuites'
];

// Dangerous sports & combat keywords that trigger auto safety warnings
const DANGEROUS_ACTION_KEYWORDS = [
  'sport', 'sports', 'extreme', 'extrême', 'danger', 'dangereux', 'combat',
  'fight', 'cascade', 'stunt', 'parkour', 'escalade', 'chute', 'mma',
  'boxe', 'kungfu', 'art_martial', 'saut_extreme', 'vtt_downhill', 'motonautisme'
];

export interface ModerationCheckResult {
  isAllowed: boolean;
  reason?: string;
  isDangerousContent: boolean;
  suggestedSafetyWarning?: string;
}

/**
 * Checks video caption, tags, and sound title against TokVibe community safety standards.
 */
export function validateVideoSafety(
  caption: string,
  tags: string[] = [],
  musicTitle: string = '',
  category: string = 'lifestyle'
): ModerationCheckResult {
  const fullText = `${caption} ${tags.join(' ')} ${musicTitle}`.toLowerCase();

  // 1. Check for prohibited sexual content
  for (const word of PROHIBITED_SEXUAL_KEYWORDS) {
    if (new RegExp(`\\b${word}\\b`, 'i').test(fullText)) {
      return {
        isAllowed: false,
        reason: 'Publication refusée : Les contenus à caractère sexuel, pornographique ou dénudé sont strictly interdits sur TokVibe.',
        isDangerousContent: false,
      };
    }
  }

  // 2. Check for prohibited explicit violence
  for (const word of PROHIBITED_VIOLENCE_KEYWORDS) {
    if (new RegExp(`\\b${word}\\b`, 'i').test(fullText)) {
      return {
        isAllowed: false,
        reason: 'Publication refusée : Les contenus incitant à la violence gratuite, au gore ou à la haine sont strictement interdits.',
        isDangerousContent: false,
      };
    }
  }

  // 3. Check if content involves dangerous sports, combat, or risky physical stunts
  let isDangerous = category === 'sports' || category === 'extreme_sports' || category === 'combat';
  if (!isDangerous) {
    for (const word of DANGEROUS_ACTION_KEYWORDS) {
      if (new RegExp(`\\b${word}\\b`, 'i').test(fullText)) {
        isDangerous = true;
        break;
      }
    }
  }

  return {
    isAllowed: true,
    isDangerousContent: isDangerous,
    suggestedSafetyWarning: isDangerous
      ? '⚠️ Avertissement de sécurité : Action sportive ou physique potentiellement risquée. Ne tentez pas ceci chez vous.'
      : undefined,
  };
}

/**
 * Calculates remaining hours and minutes for the 24-hour video edit/delete window.
 */
export function get24HourWindowStatus(createdAtTimestamp?: number | string): {
  isWithin24Hours: boolean;
  hoursRemaining: number;
  minutesRemaining: number;
  label: string;
} {
  if (!createdAtTimestamp) {
    return {
      isWithin24Hours: true,
      hoursRemaining: 24,
      minutesRemaining: 0,
      label: 'Disponible (24h autorisées)',
    };
  }

  const createdTime =
    typeof createdAtTimestamp === 'number'
      ? createdAtTimestamp
      : new Date(createdAtTimestamp).getTime();

  const now = Date.now();
  const elapsedMs = now - createdTime;
  const maxWindowMs = 24 * 60 * 60 * 1000; // 24 hours

  if (isNaN(createdTime) || elapsedMs < 0) {
    return {
      isWithin24Hours: true,
      hoursRemaining: 24,
      minutesRemaining: 0,
      label: 'Disponible (24h autorisées)',
    };
  }

  if (elapsedMs >= maxWindowMs) {
    return {
      isWithin24Hours: false,
      hoursRemaining: 0,
      minutesRemaining: 0,
      label: 'Fenêtre de modification/suppression de 24h expirée',
    };
  }

  const remainingMs = maxWindowMs - elapsedMs;
  const hoursRemaining = Math.floor(remainingMs / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

  return {
    isWithin24Hours: true,
    hoursRemaining,
    minutesRemaining,
    label: `Modifiable & supprimable (Encore ${hoursRemaining}h ${minutesRemaining}m)`,
  };
}

/**
 * Validates video format constraints for TokVibe-style uploads.
 * TokVibe typically prefers: 9:16 aspect ratio, MP4/MOV, max duration (e.g., 60s for demo).
 */
export function validateVideoFormat(file: File): {
  isValid: boolean;
  error?: string;
} {
  // Max duration (e.g., 60 seconds)
  const MAX_DURATION = 60;
  
  // 1. File Type Check
  const validTypes = ['video/mp4', 'video/quicktime'];
  if (!validTypes.includes(file.type)) {
    return { isValid: false, error: 'Format non supporté. Utilisez MP4 ou MOV.' };
  }

  // 2. Size Check (e.g., 100MB)
  const MAX_SIZE = 100 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    return { isValid: false, error: 'Vidéo trop lourde (max 100MB).' };
  }

  return { isValid: true };
}
