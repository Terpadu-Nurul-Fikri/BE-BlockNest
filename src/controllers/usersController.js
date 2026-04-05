class usersController {
    update (req, res) {
        const { id } = req.params;

        res.send(`Update user dengan id ${id}`);
    }
}