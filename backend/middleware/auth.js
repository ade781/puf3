const auth = async (req, res, next) => {
    try {
        const userId = req.header('X-User-Id');

        if (!userId) {
            return res.status(401).json({ message: 'No user ID provided' });
        }

        req.userId = parseInt(userId);
        next();
    } catch (error) {
        res.status(401).json({ message: 'Authentication failed' });
    }
};

module.exports = auth;
