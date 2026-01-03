import { UserRepository } from "../repositories/user.repository.js";
import bcryptjs from "bcryptjs";
import { HttpError } from "../errors/http-error.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/index.js";
import { LoginDTO, RegisterDTO } from "../dtos/user.dto.js";

const userRepository = new UserRepository();

export class UserService {
  async createUser(data: RegisterDTO) {
    const emailCheck = await userRepository.getUserByEmail(data.email);
    if (emailCheck) {
      throw new HttpError(403, "Email already in use");
    }

    const hashedPassword = await bcryptjs.hash(data.password, 10);

    const { confirmPassword, ...userData } = data;

    const newUser = await userRepository.createUser({
      ...userData,
      password: hashedPassword,
    });

    return newUser;
  }

  async loginUser(data: LoginDTO) {
    const user = await userRepository.getUserByEmail(data.email);
    if (!user) {
      throw new HttpError(401, "Invalid email or password");
    }

    const validPassword = await bcryptjs.compare(data.password, user.password);
    if (!validPassword) {
      throw new HttpError(401, "Invalid email or password");
    }

    const payload = {
      id: user._id,
      email: user.email,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });

    return { token, user };
  }
}
