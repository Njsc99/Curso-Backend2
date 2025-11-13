import { dirname } from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import passport from 'passport';

//hashear contraseña

export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));

//Validar Contraseña

export const isValidPassword = (user, password) => bcrypt.compareSync(password, user.password);

const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

export const passportCall = (strategy) => {
    return async (req, res, next) => {
        passport.authenticate(strategy, { session: false }, (err, user, info) => {
            if (err) return next(err);
            if (!user) {
                return res.status(401).json({ 
                    error: info?.messages ? info.messages : info?.toString() 
                });
            }
            req.user = user;
            next();
        })(req, res, next);
    };
};