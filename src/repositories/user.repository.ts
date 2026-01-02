import User from "../models/user.model.js";

export class UserRepository {
  getUserByEmail(email: string) {
    return User.findOne({ email });
  }

  createUser(data: any) {
    return User.create(data);
  }
}
