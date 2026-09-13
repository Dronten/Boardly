import jwt from "jsonwebtoken";

export const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized", sucess: false });
        }
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ message: "Invalid token", success: false });
        };

        req.userId = decoded.userId;

        next();

    } catch (error) {
        return res.status(500).json({ message: "Invalid or expired token", success: false });
    }
}