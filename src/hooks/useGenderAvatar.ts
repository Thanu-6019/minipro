import { useAuthStore } from '../store/authStore';

const maleAvatar = require('../../assets/avatars/male.png');
const femaleAvatar = require('../../assets/avatars/female.png');

function isFemale(gender?: string | null): boolean {
  if (!gender) return false;
  const g = gender.trim().toLowerCase();
  return g === 'female' || g === 'f' || g === 'woman' || g === 'girl' || g === 'she/her';
}

export function useGenderAvatar() {
  const user = useAuthStore((state) => state.user);
  const gender = user?.user_metadata?.gender as string | undefined;
  const source = isFemale(gender) ? femaleAvatar : maleAvatar;
  return source;
}
