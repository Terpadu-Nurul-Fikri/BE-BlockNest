import bcrypt from "bcryptjs";
import { prisma } from "../config/index.js";

const splitName = (fullName = "") => {
    const trimmed = fullName.trim();

    if (!trimmed) {
        return { firstName: "", lastName: "" };
    }

    const [firstName, ...rest] = trimmed.split(/\s+/);

    return {
        firstName,
        lastName: rest.join(" "),
    };
};

const sanitizeUser = (user) => {
    const { password, ...safeUser } = user;
    const { firstName, lastName } = splitName(user.name);

    return {
        ...safeUser,
        firstName,
        lastName,
    };
};

const buildNameFromParts = (firstName, lastName) => {
    return [firstName, lastName].filter(Boolean).join(" ").trim();
};

export const getUserProfile = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ error: "Not authorized" });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json({
            status: "success",
            data: sanitizeUser(user),
        });
    } catch (error) {
        console.error("Get user profile error:", error);
        return res.status(500).json({ error: "Failed to fetch user profile" });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ error: "Not authorized" });
        }

        const { firstName, lastName, phone, password, newPassword } = req.body;

        const existingUser = await prisma.user.findUnique({
            where: { id: req.user.id },
        });

        if (!existingUser) {
            return res.status(404).json({ error: "User not found" });
        }

        const dataToUpdate = {};

        if (firstName !== undefined || lastName !== undefined) {
            const currentNameParts = splitName(existingUser.name || "");

            // PERBAIKAN ESLINT: Diubah menjadi positif (=== undefined)
            const nextFirstName =
                firstName === undefined ? currentNameParts.firstName : String(firstName).trim();
            const nextLastName =
                lastName === undefined ? currentNameParts.lastName : String(lastName).trim();

            const fullName = buildNameFromParts(nextFirstName, nextLastName);

            if (!fullName) {
                return res.status(400).json({
                    error: "firstName or lastName must produce a valid name",
                });
            }

            dataToUpdate.name = fullName;
        }

        if (phone !== undefined) {
            const normalizedPhone = String(phone).trim();
            dataToUpdate.phone = normalizedPhone || null;
        }

        const passwordCandidate = newPassword ?? password;

        if (passwordCandidate !== undefined) {
            const normalizedPassword = String(passwordCandidate);

            if (!normalizedPassword.trim()) {
                return res.status(400).json({
                    error: "Password cannot be empty",
                });
            }

            const salt = await bcrypt.genSalt(10);
            dataToUpdate.password = await bcrypt.hash(normalizedPassword, salt);
        }

        if (Object.keys(dataToUpdate).length === 0) {
            return res.status(400).json({
                error: "No valid profile fields provided",
            });
        }

        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: dataToUpdate,
        });

        return res.status(200).json({
            status: "success",
            data: sanitizeUser(updatedUser),
        });
    } catch (error) {
        console.error("Update user profile error:", error);
        return res.status(500).json({ error: "Failed to update user profile" });
    }
};

export const deleteUserProfile = async (req, res) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ error: "Not authorized" });
        }

        const existingUser = await prisma.user.findUnique({
            where: { id: req.user.id },
        });

        if (!existingUser) {
            return res.status(404).json({ error: "User not found" });
        }

        await prisma.user.delete({
            where: { id: req.user.id },
        });

        return res.status(200).json({
            status: "success",
            message: "User profile deleted successfully",
        });
    } catch (error) {
        console.error("Delete user profile error:", error);
        return res.status(500).json({ error: "Failed to delete user profile" });
    }
};