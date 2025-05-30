import { User } from '../../entities/user.entity';
import { Profile } from '../../entities/profile.entity';

export type UserWithProfile = Omit<User, 'profile'> & {
  profile: Profile;
};