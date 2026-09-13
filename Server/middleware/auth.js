import jwt from "jsonwebtoken";

export const isAuthenticated = async (req, res, next) => {
    try {
        // Extracting the token from cookies
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized", success: false });
        }

        //Verifying the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.userId = decoded.userId;
        next();

    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token", success: false });
    }
}