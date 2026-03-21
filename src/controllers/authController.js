


const register = async (req, res) => {
    try {
        res.json({ message: "register" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const login = async (req,res ) => {
    
}



export { register };