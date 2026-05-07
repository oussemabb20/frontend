export interface SubmissionRecord {
  id: string;
  challengeId: string;
  challengeTitle: string;
  language: string;
  passedTests: number;
  totalTests: number;
  success: boolean;
  submittedAt: string;
}

export interface LevelProgress {
  level: number;
  totalXp: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  progressPercent: number;
}

export interface XpAwardResult {
  awarded: boolean;
  xpAwarded: number;
  reason?: string;
  progress: LevelProgress;
}

const DIFFICULTY_XP: Record<string, number> = {
  easy: 20,
  medium: 50,
  hard: 120,
  expert: 120,
};

const BASE_LEVEL_XP = 40;
const LEVEL_MULTIPLIER = 1.3;

const APP_PREFIX = 'bytebattle';
const PROGRESS_UPDATED_EVENT = 'bytebattle-progress-updated';

export const getUserKey = (): string => {
  try {
    const rawUser = globalThis.localStorage?.getItem('user');
    if (!rawUser) return 'guest';

    const parsed = JSON.parse(rawUser);
    return parsed?._id || parsed?.id || parsed?.email || 'guest';
  } catch {
    return 'guest';
  }
};

export const getSubmissionsStorageKey = () => `${APP_PREFIX}:submissions:${getUserKey()}`;
export const getSolvedStorageKey = () => `${APP_PREFIX}:solved:${getUserKey()}`;
export const getProfileProgressStorageKey = () => `${APP_PREFIX}:profile-progress:${getUserKey()}`;

const emitProgressUpdate = () => {
  globalThis.dispatchEvent(new CustomEvent(PROGRESS_UPDATED_EVENT));
};

export const safeReadArray = <T>(key: string): T[] => {
  try {
    const raw = globalThis.localStorage?.getItem(key);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const safeWriteArray = <T>(key: string, value: T[]) => {
  globalThis.localStorage?.setItem(key, JSON.stringify(value));
};

export const safeReadObject = <T>(key: string, fallback: T): T => {
  try {
    const raw = globalThis.localStorage?.getItem(key);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
};

export const safeWriteObject = <T>(key: string, value: T) => {
  globalThis.localStorage?.setItem(key, JSON.stringify(value));
};

export const getXpRequiredForLevel = (level: number): number => {
  return Math.max(1, Math.round(BASE_LEVEL_XP * LEVEL_MULTIPLIER ** (level - 1)));
};

export const calculateLevelProgress = (totalXp: number): LevelProgress => {
  let remainingXp = Math.max(0, Math.floor(totalXp));
  let level = 1;

  let neededForNext = getXpRequiredForLevel(level);
  while (remainingXp >= neededForNext) {
    remainingXp -= neededForNext;
    level += 1;
    neededForNext = getXpRequiredForLevel(level);
  }

  return {
    level,
    totalXp: Math.max(0, Math.floor(totalXp)),
    xpIntoLevel: remainingXp,
    xpForNextLevel: neededForNext,
    progressPercent: Number(((remainingXp / neededForNext) * 100).toFixed(1)),
  };
};

class ProgressTrackerService {
  getCurrentSolveStreak(): number {
    const successfulSubmissions = this.getSubmissions()
      .filter((submission) => submission.success)
      .map((submission) => new Date(submission.submittedAt));

    if (successfulSubmissions.length === 0) return 0;

    const uniqueDays = new Set(
      successfulSubmissions.map((date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }),
    );

    const hasDay = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return uniqueDays.has(`${y}-${m}-${d}`);
    };

    const latestSolveDate = successfulSubmissions.reduce((latest, current) =>
      current.getTime() > latest.getTime() ? current : latest,
    );

    latestSolveDate.setHours(0, 0, 0, 0);

    let streak = 0;
    const cursor = new Date(latestSolveDate);

    while (hasDay(cursor)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
  }

  getChallengeXpByDifficulty(difficulty?: string): number {
    if (!difficulty) return DIFFICULTY_XP.hard;
    const normalized = difficulty.toLowerCase();
    return DIFFICULTY_XP[normalized] ?? DIFFICULTY_XP.hard;
  }

  getLevelProgress(totalXp?: number): LevelProgress {
    if (typeof totalXp === 'number') {
      return calculateLevelProgress(totalXp);
    }

    const stored = safeReadObject<{ totalXp?: number }>(getProfileProgressStorageKey(), { totalXp: 0 });
    return calculateLevelProgress(Number(stored.totalXp || 0));
  }

  awardXpForChallengeSolve(challengeId: string, difficulty?: string): XpAwardResult {
    if (this.isChallengeSolved(challengeId)) {
      return {
        awarded: false,
        xpAwarded: 0,
        reason: 'already_solved',
        progress: this.getLevelProgress(),
      };
    }

    const xpAwarded = this.getChallengeXpByDifficulty(difficulty);
    const currentProgress = this.getLevelProgress();
    const newTotalXp = currentProgress.totalXp + xpAwarded;

    safeWriteObject(getProfileProgressStorageKey(), { totalXp: newTotalXp });

    return {
      awarded: true,
      xpAwarded,
      progress: calculateLevelProgress(newTotalXp),
    };
  }

  getSubmissions(): SubmissionRecord[] {
    return safeReadArray<SubmissionRecord>(getSubmissionsStorageKey()).sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
    );
  }

  getChallengeSubmissions(challengeId: string): SubmissionRecord[] {
    return this.getSubmissions().filter((submission) => submission.challengeId === challengeId);
  }

  saveSubmission(record: SubmissionRecord): void {
    const submissions = this.getSubmissions();
    submissions.unshift(record);
    safeWriteArray(getSubmissionsStorageKey(), submissions);
    emitProgressUpdate();
  }

  getSolvedChallengeIds(): string[] {
    return safeReadArray<string>(getSolvedStorageKey());
  }

  isChallengeSolved(challengeId: string): boolean {
    return this.getSolvedChallengeIds().includes(challengeId);
  }

  markChallengeSolved(challengeId: string): void {
    const solvedIds = new Set(this.getSolvedChallengeIds());
    solvedIds.add(challengeId);
    safeWriteArray(getSolvedStorageKey(), Array.from(solvedIds));
    emitProgressUpdate();
  }

  getProgressEventName(): string {
    return PROGRESS_UPDATED_EVENT;
  }
}

export const progressTrackerService = new ProgressTrackerService();
export default progressTrackerService;
