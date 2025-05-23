import { User } from 'src/auth/entities/user.entity';

export function mapExpressUserToAppUser(expressUser: any): User {
  const user = new User();
  user.id = expressUser.id;
  user.firstname = expressUser.firstname;
  user.lastname = expressUser.lastname;
  user.email = expressUser.email;
  user.photo = expressUser.photo;
  user.roles = expressUser.roles;
  return user;
}
