import { atom } from 'nanostores';

export interface UserProfile {
  id?: string;
  full_name: string;
  email: string;
  credits_balance: number;
}

export const userProfileState = atom<UserProfile | null>(null);

export const setUserProfile = (profile: UserProfile | null) => {
  userProfileState.set(profile);
};

export const updateCredits = (newBalance: number) => {
  const current = userProfileState.get();
  if (current) {
    userProfileState.set({ ...current, credits_balance: newBalance });
  }
};
