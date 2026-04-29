
import { prisma } from "../config/index.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        if (userExists) {
            return res.status(400).json({ error: "User already exists with this email" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            }
        })

        const token = generateToken(user.id);

        res.status(201).json({
            status: "success",
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                }
            }
        })
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        })
        if (!user) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const token = generateToken(user.id);

        res.status(200).json({
            status: "success",
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                }
            }
        })
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}



export { register, login };
