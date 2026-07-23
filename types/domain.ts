export type Gender = "woman" | "man" | "non_binary";
export type RelationshipGoal =
  "Long-term relationship" | "Life partner" | "Dating" | "Open to exploring";

export interface Profile {
  id: string;
  name: string;
  age: number;
  pronouns: string;
  city: string;
  distanceKm: number;
  photo: string;
  photos: string[];
  verified: boolean;
  online: boolean;
  compatibility: number;
  occupation: string;
  company: string;
  education: string;
  bio: string;
  prompt: {
    question: string;
    answer: string;
  };
  interests: string[];
  languages: string[];
  heightCm: number;
  religion: string;
  relationshipGoal: RelationshipGoal;
  lifestyle: {
    drinking: string;
    smoking: string;
    pets: string;
    workout: string;
  };
}

export interface Conversation {
  id: string;
  profile: Profile;
  lastMessage: string;
  time: string;
  unread: number;
  typing?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: "me" | "them";
  body: string;
  sentAt: string;
  status?: "sent" | "seen";
  replyTo?: string;
}

export interface Community {
  id: string;
  name: string;
  emoji: string;
  category: string;
  members: number;
  description: string;
  joined: boolean;
  privacy: "Public" | "Private";
  gradient: string;
}

export interface NearbyEvent {
  id: string;
  title: string;
  date: string;
  venue: string;
  distanceKm: number;
  attendees: number;
  category: string;
  gradient: string;
}

export interface Gift {
  id: string;
  name: string;
  emoji: string;
  description: string;
  value: string;
  color: string;
}
