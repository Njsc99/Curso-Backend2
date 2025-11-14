import passport from "passport";
import GitHubStrategy from "passport-github2";
import local from "passport-local";
import userService from "../models/user.model.js";
import cartModel from "../models/cart.model.js";
import { createHash, isValidPassword } from "../utils.js";
import jwt from "passport-jwt";
import dotenv from "dotenv";

dotenv.config();

const LocalStrategy = local.Strategy;
const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;

const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['token'];
    } else if (req && req.headers && req.headers.authorization) {
        const parts = req.headers.authorization.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
            token = parts[1];
        }
    }
    return token;
};

const initializePassport = () => {

    passport.use("jwt", new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
        secretOrKey: process.env.JWT_SECRET || "coderSecret",
    }, async (jwt_payload, done) => {
        try {
            return done(null, jwt_payload);
        } catch (error) {
            return done(error);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        let user = await userService.findById(id);
        done(null, user);
    });

    // Middleware de login
    passport.use("login", new LocalStrategy({ usernameField: "email" }, async (username, password, done) => {
        try {
            const user = await userService.findOne({ email: username });
            if (!user) {
                console.log("Usuario no encontrado");
                return done(null, false);
            }
            if (!isValidPassword(user, password)) return done(null, false);
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }));

    // Estrategia de registro
    passport.use("register", new LocalStrategy(
        { passReqToCallback: true, usernameField: "email" },
        async (req, username, password, done) => {
            try {
                const { first_name, last_name, age } = req.body;
                let user = await userService.findOne({ email: username });
                if (user) {
                    console.log("Usuario ya existe");
                    return done(null, false);
                }
                
                // Crear carrito vacío para el nuevo usuario
                const newCart = await cartModel.create({ products: [] });
                
                const newUser = {
                    first_name,
                    last_name,
                    email: username,
                    age,
                    password: createHash(password),
                    cart: newCart._id,
                    role: 'user'
                };
                let result = await userService.create(newUser);
                return done(null, result);
            } catch (error) {
                return done(error);
            }
        }
    ));

    // Estrategia GitHub
    passport.use("github", new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:8080/api/sessions/github/callback",
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            console.log(profile);
            const email = profile._json.email || `${profile.username}@github.com`;
            
            let user = await userService.findOne({ email });
            
            if (!user) {
                // Crear carrito para usuarios de GitHub
                const newCart = await cartModel.create({ products: [] });
                
                const newUser = {
                    first_name: profile._json.name || profile.username,
                    last_name: "",
                    email: email,
                    age: 18,
                    password: "",
                    cart: newCart._id,
                    role: 'user'
                };
                let result = await userService.create(newUser);
                return done(null, result);
            } else {
                return done(null, user);
            }
        } catch (error) {
            console.error("Error en GitHub Strategy:", error);
            return done(error);
        }
    }));

};

export default initializePassport;