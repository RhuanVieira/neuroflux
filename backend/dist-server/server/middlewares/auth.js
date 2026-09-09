import jwt from "jsonwebtoken";
const jwtSecret = process.env.JWT_SECRET ?? "";
if (!jwtSecret)
    throw new Error("JWT_SECRET não foi configurado. Copie .env.example para .env.");
export function tokenFor(user) { return jwt.sign(user, jwtSecret, { expiresIn: "8h" }); }
export function authenticate(req, res, next) {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!token)
        return res.status(401).json({ message: "Faça login para continuar." });
    try {
        req.user = jwt.verify(token, jwtSecret);
        return next();
    }
    catch {
        return res.status(401).json({ message: "Sessão inválida ou expirada." });
    }
}
export function allow(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role))
            return res.status(403).json({ message: "Você não tem permissão para esta ação." });
        return next();
    };
}
