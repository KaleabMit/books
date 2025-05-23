import { RolesBuilder } from "nest-access-control";

export enum UserRoles {
  Admin = "Admin",
  Reader = "Reader",
  BookProvider = "BookProvider",
  Moderator = "Moderator",
}

export const roles: RolesBuilder = new RolesBuilder();

roles.grant(UserRoles.Reader)
  .readAny("posts")
  .grant(UserRoles.Admin)
  .extend(UserRoles.Reader)
  .updateAny("posts")
  .createAny("posts")
  .deleteAny("posts")
  // new
  .grant(UserRoles.BookProvider)
  .createAny("posts")
  .updateAny("posts")
  .deleteAny("posts")
  .grant(UserRoles.Moderator)
  .updateAny("posts")
  .createAny("posts")
  .deleteAny("posts");

roles
  .grant(UserRoles.Reader)
  .readAny("user")
  .grant(UserRoles.Admin)
  .extend(UserRoles.Reader)
  .updateAny("user")
  .createAny("user")
  .deleteAny("user")
  .grant(UserRoles.BookProvider)
  .extend(UserRoles.Reader)
  .grant(UserRoles.Moderator)
  .extend(UserRoles.Reader);

roles
  .grant(UserRoles.Reader)
  .readAny("category")
  .grant(UserRoles.Admin)
  .extend(UserRoles.Reader)
  .updateAny("category")
  .createAny("category")
  .deleteAny("category")
  .grant(UserRoles.BookProvider)
  .extend(UserRoles.Reader)
  .grant(UserRoles.Moderator)
  .extend(UserRoles.Reader);

  roles
  .grant(UserRoles.Reader)
  .readAny("message")
  .grant(UserRoles.Admin)
  .extend(UserRoles.Reader)
  .updateAny("message")
  .createAny("message")
  .deleteAny("message")
  .grant(UserRoles.BookProvider)
  .extend(UserRoles.Reader)
  .grant(UserRoles.Moderator)
  .extend(UserRoles.Reader);

