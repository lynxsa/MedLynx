// Community Service for MedLynx Support Groups
// Enables anonymous health condition chatrooms and peer support

export interface SupportGroup {
  id: string;
  name: string;
  description: string;
  category: 'chronic_conditions' | 'mental_health' | 'diabetes' | 'hypertension' | 'pregnancy' | 'senior_health' | 'general_wellness';
  memberCount: number;
  isActive: boolean;
  moderatedBy: string;
  tags: string[];
  lastActivity: Date;
  privacy: 'public' | 'private' | 'medical_professional_only';
  southAfricanFocus: boolean;
  languages: string[];
}

export interface CommunityMessage {
  id: string;
  groupId: string;
  anonymousId: string;
  displayName: string; // Like "Anonymous Warrior", "Hope Seeker"
  content: string;
  timestamp: Date;
  type: 'text' | 'support' | 'question' | 'success_story' | 'resource_share';
  reactions: {
    hearts: number;
    thanks: number;
    hugs: number;
    strength: number;
  };
  isModerated: boolean;
  isVerifiedMedical?: boolean;
  tags?: string[];
}

export interface UserCommunityProfile {
  anonymousId: string;
  displayName: string;
  joinedGroups: string[];
  contributionScore: number;
  helpfulnessRating: number;
  badges: string[];
  lastActive: Date;
  preferences: {
    anonymityLevel: 'full' | 'partial' | 'open';
    notificationsEnabled: boolean;
    mentorshipInterest: boolean;
  };
}

class CommunityService {
  private static instance: CommunityService;
  private userProfile: UserCommunityProfile | null = null;
  private supportGroups: SupportGroup[] = [];

  private constructor() {
    this.initializeSouthAfricanGroups();
  }

  static getInstance(): CommunityService {
    if (!CommunityService.instance) {
      CommunityService.instance = new CommunityService();
    }
    return CommunityService.instance;
  }

  private initializeSouthAfricanGroups(): void {
    // Initialize South African focused support groups
    this.supportGroups = [
      {
        id: 'diabetes_sa',
        name: 'Diabetes Warriors SA',
        description: 'Support for diabetes management in South Africa. Share experiences, tips, and encouragement.',
        category: 'diabetes',
        memberCount: 247,
        isActive: true,
        moderatedBy: 'Dr. LYNX Community Team',
        tags: ['diabetes', 'south-africa', 'lifestyle', 'medication', 'diet'],
        lastActivity: new Date(),
        privacy: 'public',
        southAfricanFocus: true,
        languages: ['English', 'Afrikaans', 'Zulu', 'Xhosa']
      },
      {
        id: 'hypertension_support',
        name: 'Blood Pressure Buddies',
        description: 'Managing hypertension together. Local resources, medication access, and lifestyle tips.',
        category: 'hypertension',
        memberCount: 189,
        isActive: true,
        moderatedBy: 'Registered Nurse Sarah',
        tags: ['hypertension', 'blood-pressure', 'medication', 'exercise', 'stress'],
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        privacy: 'public',
        southAfricanFocus: true,
        languages: ['English', 'Afrikaans']
      },
      {
        id: 'mental_wellness_sa',
        name: 'Mental Wellness Circle',
        description: 'Safe space for mental health discussions. Culturally sensitive support for South Africans.',
        category: 'mental_health',
        memberCount: 312,
        isActive: true,
        moderatedBy: 'Licensed Counselor Team',
        tags: ['mental-health', 'anxiety', 'depression', 'wellness', 'ubuntu'],
        lastActivity: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        privacy: 'public',
        southAfricanFocus: true,
        languages: ['English', 'Afrikaans', 'Zulu', 'Xhosa', 'Sotho']
      },
      {
        id: 'pregnancy_journey',
        name: 'Pregnancy Journey SA',
        description: 'Expecting mothers sharing experiences, concerns, and celebrating milestones together.',
        category: 'pregnancy',
        memberCount: 156,
        isActive: true,
        moderatedBy: 'Midwife Community',
        tags: ['pregnancy', 'prenatal', 'maternal-health', 'newborn', 'breastfeeding'],
        lastActivity: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        privacy: 'public',
        southAfricanFocus: true,
        languages: ['English', 'Afrikaans', 'Zulu']
      },
      {
        id: 'chronic_conditions',
        name: 'Chronic Conditions Support',
        description: 'Living well with chronic conditions. Share strategies, resources, and hope.',
        category: 'chronic_conditions',
        memberCount: 98,
        isActive: true,
        moderatedBy: 'Healthcare Professional Team',
        tags: ['chronic-illness', 'autoimmune', 'pain-management', 'advocacy'],
        lastActivity: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
        privacy: 'public',
        southAfricanFocus: true,
        languages: ['English', 'Afrikaans']
      },
      {
        id: 'senior_health',
        name: 'Golden Years Health',
        description: 'Health and wellness for seniors. Navigate aging with dignity and support.',
        category: 'senior_health',
        memberCount: 134,
        isActive: true,
        moderatedBy: 'Geriatric Specialist',
        tags: ['senior-health', 'aging', 'mobility', 'medication-management', 'family'],
        lastActivity: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        privacy: 'public',
        southAfricanFocus: true,
        languages: ['English', 'Afrikaans']
      }
    ];
  }

  // Get available support groups
  getSupportGroups(category?: SupportGroup['category']): SupportGroup[] {
    if (category) {
      return this.supportGroups.filter(group => group.category === category);
    }
    return this.supportGroups.sort((a, b) => b.memberCount - a.memberCount);
  }

  // Join a support group
  async joinSupportGroup(groupId: string): Promise<{ success: boolean; message: string }> {
    try {
      const group = this.supportGroups.find(g => g.id === groupId);
      if (!group) {
        return { success: false, message: 'Support group not found' };
      }

      if (!this.userProfile) {
        // Create anonymous profile
        this.userProfile = await this.createAnonymousProfile();
      }

      if (this.userProfile.joinedGroups.includes(groupId)) {
        return { success: false, message: 'Already a member of this group' };
      }

      this.userProfile.joinedGroups.push(groupId);
      group.memberCount += 1;

      // Save to storage
      await this.saveUserProfile();

      return { 
        success: true, 
        message: `Welcome to ${group.name}! You're now connected with ${group.memberCount} members.` 
      };
    } catch (error) {
      console.error('Failed to join support group:', error);
      return { success: false, message: 'Failed to join group. Please try again.' };
    }
  }

  // Leave a support group
  async leaveSupportGroup(groupId: string): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.userProfile) {
        return { success: false, message: 'Not a member of any groups' };
      }

      const groupIndex = this.userProfile.joinedGroups.indexOf(groupId);
      if (groupIndex === -1) {
        return { success: false, message: 'Not a member of this group' };
      }

      const group = this.supportGroups.find(g => g.id === groupId);
      if (group) {
        group.memberCount = Math.max(0, group.memberCount - 1);
      }

      this.userProfile.joinedGroups.splice(groupIndex, 1);
      await this.saveUserProfile();

      return { success: true, message: 'Successfully left the support group' };
    } catch (error) {
      console.error('Failed to leave support group:', error);
      return { success: false, message: 'Failed to leave group. Please try again.' };
    }
  }

  // Get messages for a support group
  async getGroupMessages(groupId: string, limit: number = 50): Promise<CommunityMessage[]> {
    // Mock messages - in real implementation, fetch from server
    const mockMessages: CommunityMessage[] = [
      {
        id: '1',
        groupId,
        anonymousId: 'anon_123',
        displayName: 'Hope Warrior',
        content: 'Just wanted to share that my blood pressure has been stable for 3 weeks now! Small victories count. 💪',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        type: 'success_story',
        reactions: { hearts: 12, thanks: 5, hugs: 3, strength: 8 },
        isModerated: true,
        tags: ['success', 'blood-pressure', 'motivation']
      },
      {
        id: '2',
        groupId,
        anonymousId: 'anon_456',
        displayName: 'Caring Friend',
        content: 'That\'s amazing news! What changes did you make to your routine? I\'m struggling with consistency.',
        timestamp: new Date(Date.now() - 25 * 60 * 1000),
        type: 'question',
        reactions: { hearts: 2, thanks: 1, hugs: 0, strength: 1 },
        isModerated: true
      },
      {
        id: '3',
        groupId,
        anonymousId: 'anon_789',
        displayName: 'Wellness Guide',
        content: 'Remember everyone, medication adherence is key. Set those reminders and don\'t skip doses. Your future self will thank you! 🏥',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        type: 'support',
        reactions: { hearts: 15, thanks: 10, hugs: 2, strength: 7 },
        isModerated: true,
        isVerifiedMedical: true,
        tags: ['medication', 'adherence', 'professional-advice']
      }
    ];

    return mockMessages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
  }

  // Send message to support group
  async sendMessage(
    groupId: string, 
    content: string, 
    type: CommunityMessage['type'] = 'text'
  ): Promise<{ success: boolean; message: CommunityMessage | null }> {
    try {
      if (!this.userProfile) {
        this.userProfile = await this.createAnonymousProfile();
      }

      if (!this.userProfile.joinedGroups.includes(groupId)) {
        return { success: false, message: null };
      }

      const newMessage: CommunityMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        groupId,
        anonymousId: this.userProfile.anonymousId,
        displayName: this.userProfile.displayName,
        content,
        timestamp: new Date(),
        type,
        reactions: { hearts: 0, thanks: 0, hugs: 0, strength: 0 },
        isModerated: false // Will be moderated after posting
      };

      // In real implementation, send to server
      // For now, just return success

      return { success: true, message: newMessage };
    } catch (error) {
      console.error('Failed to send message:', error);
      return { success: false, message: null };
    }
  }

  // Create anonymous profile
  private async createAnonymousProfile(): Promise<UserCommunityProfile> {
    const anonymousNames = [
      'Hope Warrior', 'Wellness Seeker', 'Strength Builder', 'Health Guardian', 
      'Healing Spirit', 'Brave Heart', 'Life Champion', 'Victory Pursuer',
      'Courage Finder', 'Peace Maker', 'Joy Keeper', 'Dream Chaser'
    ];

    const profile: UserCommunityProfile = {
      anonymousId: `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      displayName: anonymousNames[Math.floor(Math.random() * anonymousNames.length)],
      joinedGroups: [],
      contributionScore: 0,
      helpfulnessRating: 0,
      badges: ['New Member'],
      lastActive: new Date(),
      preferences: {
        anonymityLevel: 'full',
        notificationsEnabled: true,
        mentorshipInterest: false
      }
    };

    this.userProfile = profile;
    await this.saveUserProfile();
    return profile;
  }

  // Save user profile
  private async saveUserProfile(): Promise<void> {
    if (this.userProfile) {
      try {
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        await AsyncStorage.default.setItem('communityProfile', JSON.stringify(this.userProfile));
      } catch (error) {
        console.error('Failed to save community profile:', error);
      }
    }
  }

  // Load user profile
  async loadUserProfile(): Promise<UserCommunityProfile | null> {
    try {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      const profileData = await AsyncStorage.default.getItem('communityProfile');
      if (profileData) {
        this.userProfile = JSON.parse(profileData);
        return this.userProfile;
      }
    } catch (error) {
      console.error('Failed to load community profile:', error);
    }
    return null;
  }

  // Get user's joined groups
  getUserGroups(): SupportGroup[] {
    if (!this.userProfile) return [];
    
    return this.supportGroups.filter(group => 
      this.userProfile!.joinedGroups.includes(group.id)
    );
  }

  // Search support groups
  searchGroups(query: string): SupportGroup[] {
    const lowerQuery = query.toLowerCase();
    return this.supportGroups.filter(group =>
      group.name.toLowerCase().includes(lowerQuery) ||
      group.description.toLowerCase().includes(lowerQuery) ||
      group.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  // Get community statistics
  getCommunityStats(): {
    totalGroups: number;
    totalMembers: number;
    activeGroups: number;
    averageGroupSize: number;
    languagesSupported: number;
  } {
    const totalMembers = this.supportGroups.reduce((sum, group) => sum + group.memberCount, 0);
    const activeGroups = this.supportGroups.filter(group => group.isActive).length;
    const allLanguages = new Set(this.supportGroups.flatMap(group => group.languages));

    return {
      totalGroups: this.supportGroups.length,
      totalMembers,
      activeGroups,
      averageGroupSize: Math.round(totalMembers / this.supportGroups.length),
      languagesSupported: allLanguages.size
    };
  }

  // React to a message
  async reactToMessage(messageId: string, reactionType: keyof CommunityMessage['reactions']): Promise<boolean> {
    try {
      // In real implementation, send reaction to server
      // For now, just return success
      return true;
    } catch (error) {
      console.error('Failed to react to message:', error);
      return false;
    }
  }

  // Report inappropriate content
  async reportContent(messageId: string, reason: string): Promise<boolean> {
    try {
      // In real implementation, send report to moderation team
      console.log(`Content reported: ${messageId}, Reason: ${reason}`);
      return true;
    } catch (error) {
      console.error('Failed to report content:', error);
      return false;
    }
  }

  getUserProfile(): UserCommunityProfile | null {
    return this.userProfile;
  }
}

export const communityService = CommunityService.getInstance();
