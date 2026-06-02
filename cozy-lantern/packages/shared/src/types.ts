// ─── Battery Modes ────────────────────────────────────────────────────────────

export type BatteryMode = 'high' | 'balanced' | 'saver' | 'off';

// ─── Users ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  familyId?: string;
  fcmTokens?: string[];
  settings: UserSettings;
  createdAt: number;
  updatedAt: number;
}

export interface UserSettings {
  batteryMode: BatteryMode;
  locationSharing: boolean;
  locationSharingWithFriends: boolean;
  notificationsEnabled: boolean;
}

// ─── Live Location ─────────────────────────────────────────────────────────────

export interface LiveLocation {
  userId: string;
  lat: number;
  lng: number;
  accuracy: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  batteryLevel: number;
  address?: string;
  timestamp: number;
  updatedAt: number;
}

// ─── Location History ─────────────────────────────────────────────────────────
// Written to locations/{userId}/history/{timestamp}
// Every GPS fix is recorded; timestamp (Unix ms) is the document ID.

export interface LocationHistoryPoint {
  lat: number;
  lng: number;
  accuracy: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  address?: string;
  timestamp: number;
}

// ─── Families ─────────────────────────────────────────────────────────────────

export interface Family {
  id: string;
  name: string;
  inviteCode: string;
  createdBy: string;
  photoURL?: string;
  createdAt: number;
  updatedAt: number;
}

export type FamilyMemberRole = 'owner' | 'admin' | 'member';

export interface FamilyMember {
  userId: string;
  displayName: string;
  photoURL?: string;
  role: FamilyMemberRole;
  joinedAt: number;
}

// ─── Friend Connections ───────────────────────────────────────────────────────
// connectionId = [userIdA, userIdB].sort().join('_')

export type FriendConnectionStatus = 'pending' | 'accepted' | 'blocked';

export interface FriendConnection {
  id: string;
  userIds: [string, string];
  initiatedBy: string;
  status: FriendConnectionStatus;
  locationSharingEnabled: boolean;
  createdAt: number;
  updatedAt: number;
}

// ─── Family Events ─────────────────────────────────────────────────────────────

export interface FamilyEvent {
  id: string;
  familyId: string;
  title: string;
  description?: string;
  startDate: number;
  endDate: number;
  allDay: boolean;
  location?: string;
  locationLat?: number;
  locationLng?: number;
  attendees: string[];
  color?: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

// ─── Family Tasks ─────────────────────────────────────────────────────────────

export interface FamilyTask {
  id: string;
  familyId: string;
  title: string;
  description?: string;
  assignedTo?: string;
  dueDate?: number;
  completed: boolean;
  completedAt?: number;
  completedBy?: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

// ─── Family Announcements ─────────────────────────────────────────────────────

export interface FamilyAnnouncement {
  id: string;
  familyId: string;
  title: string;
  body: string;
  createdBy: string;
  pinned: boolean;
  readBy: string[];
  expiresAt?: number;
  createdAt: number;
  updatedAt: number;
}

// ─── Push Profiles ─────────────────────────────────────────────────────────────

export interface PushProfile {
  userId: string;
  tokens: string[];
  timezoneOffset: number;
  updatedAt: number;
}
