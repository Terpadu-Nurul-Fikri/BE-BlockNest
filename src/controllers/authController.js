
import { prisma } from "../config";

const register = async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await prisma.user.findUnique({
        where: {
            email: email
        }
    })

    if (userExists) {
        return res.status(400).json({ error: "User dengan alamat email ini sudah ada" });
    }
}

const login = async (req,res ) => {
    
}



export { register };