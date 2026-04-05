
import { prisma } from "../config";

const register = async (req, res) => {
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

    res.status(201).json({
        status: "success",
        data: {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            }
        }
    })
}

const login = async (req, res) => {

}



export { register };