import { UserModel, IUser } from "../models/user.model.js";

export interface IUserRepository {
  getUserByEmail(email: string): Promise<IUser | null>;
  createUser(userData: Partial<IUser>): Promise<IUser>;

  getUserById(id: string): Promise<IUser | null>;
  getAllUsers(): Promise<IUser[]>;
  getUsersByRole(role: string): Promise<IUser[]>;
  getAllUsersWithPagination(page: number, limit: number): Promise<{ users: IUser[]; totalUsers: number }>;
  updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null>;
  deleteUser(id: string): Promise<boolean>;
}

export class UserRepository implements IUserRepository {
  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const user = new UserModel(userData);
    return await user.save();
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email });
  }

  async getUserById(id: string): Promise<IUser | null> {
    return await UserModel.findById(id);
  }

  async getAllUsers(): Promise<IUser[]> {
    return await UserModel.find();
  }

  async getUsersByRole(role: string): Promise<IUser[]> {
    return await UserModel.find({ role });
  }

  async getAllUsersWithPagination(page: number, limit: number): Promise<{ users: IUser[]; totalUsers: number }> {
    const skip = (page - 1) * limit;
    const [users, totalUsers] = await Promise.all([
      UserModel.find().skip(skip).limit(limit),
      UserModel.countDocuments()
    ]);
    return { users, totalUsers };
  }

  async updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(id, updateData, { new: true });
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return result ? true : false;
  }
}
