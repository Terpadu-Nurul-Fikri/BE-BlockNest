
import { prisma } from "../config/index.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

const register = async (req, res) => {
    try {
        const { userName, email, password, firstName, lastName } = req.body;

        if (!userName || !email || !password) {
            return res.status(400).json({ status: "error", message: "Missing required fields" });
        }

        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) {
            return res.status(400).json({ status: "error", message: "User already exists with this email" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: {
                userName,
                email,
                password: hashedPassword,
                firstName: firstName ?? "",
                lastName: lastName ?? null,
            },
        });

        const token = generateToken(user.id);

        res.status(201).json({
            status: "success",
            data: {
                token,
                user: {
                    id: user.id,
                    userName: user.userName,
                    email: user.email,
                    role: user.role,
                },
            },
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Registration failed", error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ status: "error", message: "Missing email or password" });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(400).json({ status: "error", message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ status: "error", message: "Invalid email or password" });
        }

        const token = generateToken(user.id);

        res.status(200).json({
            status: "success",
            data: {
                token,
                user: {
                    id: user.id,
                    userName: user.userName,
                    email: user.email,
                    role: user.role,
                },
            },
        });
    } catch (error) {
        res.status(500).json({ status: "error", message: "Login failed", error: error.message });
    }
};

export { register, login };