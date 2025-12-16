export const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next()
    } else {
        res.redirect('/login')
    }
};

export const isNotAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return next()
    } else {
        res.redirect('/profile')
    }
};

// Middleware para verificar roles
export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                status: "error", 
                message: "No autenticado" 
            });
        }

        const userRole = req.user.role;
        
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ 
                status: "error", 
                message: "No tienes permisos para acceder a este recurso" 
            });
        }

        next();
    };
};

// Middleware específico para admin
export const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            status: "error", 
            message: "No autenticado" 
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({ 
            status: "error", 
            message: "Solo administradores pueden realizar esta acción" 
        });
    }

    next();
};

// Middleware específico para usuarios
export const isUser = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ 
            status: "error", 
            message: "No autenticado" 
        });
    }

    if (req.user.role !== 'user') {
        return res.status(403).json({ 
            status: "error", 
            message: "Solo usuarios pueden realizar esta acción" 
        });
    }

    next();
};