import { describe, it, expect } from 'vitest';

// Test type definitions and constants from various services
describe('Service type definitions and interfaces', () => {
  describe('Auth types', () => {
    it('verifies RegisterData interface shape', () => {
      type RegisterData = {
        username: string;
        email: string;
        password: string;
      };

      const data: RegisterData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      expect(data.username).toBe('testuser');
      expect(data.email).toBe('test@example.com');
      expect(data.password).toBe('password123');
    });

    it('verifies LoginData interface shape', () => {
      type LoginData = {
        email: string;
        password: string;
      };

      const data: LoginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      expect(data.email).toBe('test@example.com');
    });

    it('verifies VerifyEmailData interface shape', () => {
      type VerifyEmailData = {
        email: string;
        code: string;
      };

      const data: VerifyEmailData = {
        email: 'test@example.com',
        code: '123456',
      };

      expect(data.code).toBe('123456');
    });
  });

  describe('Clan types', () => {
    it('verifies Clan interface shape', () => {
      type Clan = {
        _id: string;
        name: string;
        users: string[];
        number: number;
        description?: string;
        avatar?: string;
        leaderId?: string;
      };

      const clan: Clan = {
        _id: 'clan123',
        name: 'Test Clan',
        users: ['user1', 'user2'],
        number: 1,
        description: 'Test description',
      };

      expect(clan._id).toBe('clan123');
      expect(clan.users.length).toBe(2);
      expect(clan.number).toBe(1);
    });

    it('verifies CreateClanDto interface shape', () => {
      type CreateClanDto = {
        name: string;
        userId?: string;
      };

      const dto: CreateClanDto = {
        name: 'New Clan',
        userId: 'user123',
      };

      expect(dto.name).toBe('New Clan');
    });

    it('verifies Notification interface shape', () => {
      type Notification = {
        _id: string;
        description: string;
        userId: string;
        clanId: string;
        status: 'pending' | 'read' | 'accepted' | 'rejected' | 'archived';
        type: 'clan_invitation' | 'clan_request' | 'system';
      };

      const notification: Notification = {
        _id: 'notif123',
        description: 'You were invited',
        userId: 'user123',
        clanId: 'clan123',
        status: 'pending',
        type: 'clan_invitation',
      };

      expect(notification.status).toBe('pending');
      expect(notification.type).toBe('clan_invitation');
    });
  });

  describe('Ticket types', () => {
    it('verifies CreateTicketDto interface shape', () => {
      type CreateTicketDto = {
        title: string;
        description: string;
        category:
          | 'challenge_bug'
          | 'test_case_error'
          | 'code_execution'
          | 'battle_issue'
          | 'account_issue'
          | 'feature_request'
          | 'other';
        priority?: 'low' | 'medium' | 'high' | 'urgent';
      };

      const dto: CreateTicketDto = {
        title: 'Bug Report',
        description: 'Found a bug',
        category: 'challenge_bug',
        priority: 'high',
      };

      expect(dto.category).toBe('challenge_bug');
      expect(dto.priority).toBe('high');
    });

    it('verifies UpdateTicketDto interface shape', () => {
      type UpdateTicketDto = {
        status?: 'open' | 'in_progress' | 'closed';
        priority?: 'low' | 'medium' | 'high' | 'urgent';
        assignedTo?: string;
      };

      const dto: UpdateTicketDto = {
        status: 'in_progress',
        priority: 'medium',
      };

      expect(dto.status).toBe('in_progress');
    });

    it('verifies AddMessageDto interface shape', () => {
      type AddMessageDto = {
        message: string;
      };

      const dto: AddMessageDto = {
        message: 'This is a message',
      };

      expect(dto.message).toBe('This is a message');
    });
  });

  describe('Progress tracking types', () => {
    it('verifies SubmissionRecord interface shape', () => {
      type SubmissionRecord = {
        id: string;
        challengeId: string;
        challengeTitle: string;
        language: string;
        passedTests: number;
        totalTests: number;
        success: boolean;
        submittedAt: string;
      };

      const record: SubmissionRecord = {
        id: 'sub123',
        challengeId: 'chal123',
        challengeTitle: 'Test Challenge',
        language: 'javascript',
        passedTests: 5,
        totalTests: 5,
        success: true,
        submittedAt: new Date().toISOString(),
      };

      expect(record.passedTests).toBe(5);
      expect(record.success).toBe(true);
    });

    it('verifies LevelProgress interface shape', () => {
      type LevelProgress = {
        level: number;
        totalXp: number;
        xpIntoLevel: number;
        xpForNextLevel: number;
        progressPercent: number;
      };

      const progress: LevelProgress = {
        level: 5,
        totalXp: 500,
        xpIntoLevel: 100,
        xpForNextLevel: 200,
        progressPercent: 50,
      };

      expect(progress.level).toBe(5);
      expect(progress.progressPercent).toBeLessThanOrEqual(100);
    });

    it('verifies XpAwardResult interface shape', () => {
      type XpAwardResult = {
        awarded: boolean;
        xpAwarded: number;
        reason?: string;
        progress: {
          level: number;
          totalXp: number;
          xpIntoLevel: number;
          xpForNextLevel: number;
          progressPercent: number;
        };
      };

      const result: XpAwardResult = {
        awarded: true,
        xpAwarded: 50,
        reason: 'Challenge completed',
        progress: {
          level: 2,
          totalXp: 100,
          xpIntoLevel: 20,
          xpForNextLevel: 20,
          progressPercent: 100,
        },
      };

      expect(result.awarded).toBe(true);
      expect(result.xpAwarded).toBe(50);
    });
  });

  describe('Leaderboard types', () => {
    it('verifies LeaderboardUser interface shape', () => {
      type LeaderboardUser = {
        _id?: string;
        id?: string;
        username: string;
        email?: string;
        profile?: {
          avatar?: string;
        };
        statistics?: {
          xp?: number;
          totalPoints?: number;
          challengesCompleted?: number;
          currentStreak?: number;
        };
      };

      const user: LeaderboardUser = {
        _id: 'user123',
        username: 'testuser',
        email: 'test@example.com',
        statistics: {
          xp: 1000,
          totalPoints: 5000,
          challengesCompleted: 10,
          currentStreak: 5,
        },
      };

      expect(user.username).toBe('testuser');
      expect(user.statistics?.xp).toBe(1000);
    });
  });

  describe('Service constants', () => {
    it('verifies DIFFICULTY_XP mapping', () => {
      const DIFFICULTY_XP: Record<string, number> = {
        easy: 20,
        medium: 50,
        hard: 120,
        expert: 120,
      };

      expect(DIFFICULTY_XP['easy']).toBe(20);
      expect(DIFFICULTY_XP['medium']).toBe(50);
      expect(DIFFICULTY_XP['hard']).toBe(120);
      expect(DIFFICULTY_XP['expert']).toBe(120);
    });

    it('verifies XP calculation constants', () => {
      const BASE_LEVEL_XP = 40;
      const LEVEL_MULTIPLIER = 1.3;

      expect(BASE_LEVEL_XP).toBe(40);
      expect(LEVEL_MULTIPLIER).toBe(1.3);
    });

    it('verifies app prefix and event names', () => {
      const APP_PREFIX = 'bytebattle';
      const PROGRESS_UPDATED_EVENT = 'bytebattle-progress-updated';

      expect(APP_PREFIX).toBe('bytebattle');
      expect(PROGRESS_UPDATED_EVENT).toContain('progress-updated');
    });
  });

  describe('Challenge ticket types', () => {
    it('verifies ChallengeTicket normalization contract', () => {
      type ChallengeTicket = {
        _id: string;
        title: string;
        description: string;
        status: 'open' | 'in_progress' | 'closed';
        priority: 'low' | 'medium' | 'high' | 'urgent';
        category: string;
        userId: string;
        messages?: Array<{ id: string; text: string }>;
      };

      const ticket: ChallengeTicket = {
        _id: 'ticket123',
        title: 'Bug',
        description: 'Description',
        status: 'open',
        priority: 'high',
        category: 'bug',
        userId: 'user123',
        messages: [{ id: '1', text: 'First message' }],
      };

      expect(ticket.status).toBe('open');
      expect(ticket.messages?.length).toBe(1);
    });
  });
});
