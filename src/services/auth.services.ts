import { RegisterDTO, LoginDTO } from "../dtos/auth.dto.js";
import { UserRepository } from "../repositories/user.repository.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/index.js";
import { HttpError } from "../errors/http-error.js";

const userRepository = new UserRepository();

export class AuthService {
  async register(data: RegisterDTO) {
    const emailCheck = await userRepository.getUserByEmail(data.email);
    if (emailCheck) throw new HttpError(403, "Email already in use");

    const hashedPassword = await bcryptjs.hash(data.password, 10);
    data.password = hashedPassword;

    return userRepository.createUser(data);
  }

  async login(data: LoginDTO) {
    const user = await userRepository.getUserByEmail(data.email);
    if (!user) throw new HttpError(401, "Invalid email or password");

    const valid = await bcryptjs.compare(data.password, user.password);
    if (!valid) throw new HttpError(401, "Invalid email or password");

    const payload = { id: user._id, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });

    return { token, user };
  }
}
