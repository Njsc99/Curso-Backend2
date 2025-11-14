import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { passportCall } from '../utils.js';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

router.get('/', (req, res) => {
    res.render('home', { title: 'Inicio', mensaje: 'Bienvenido a Handlebars' });
});

router.get('/login', (req, res) => {
    res.render('login', { 
        title: 'Login',
        error: req.query.error 
    });
});

router.get('/register', (req, res) => {
    res.render('register', { 
        title: 'Registro',
        error: req.query.error 
    });
});

router.post('/register',
    passport.authenticate('register', { 
        failureRedirect: '/register?error=1',
        session: false
    }),
    (req, res) => {
        try {
            let token = jwt.sign(
                { 
                    id: req.user._id, 
                    email: req.user.email,
                    role: req.user.role,
                    first_name: req.user.first_name,
                    last_name: req.user.last_name
                }, 
                process.env.JWT_SECRET || 'coderSecret', 
                { expiresIn: '2h' }
            );
            
            req.session.user = { 
                id: req.user._id, 
                email: req.user.email, 
                first_name: req.user.first_name 
            };
            
            res.cookie('token', token, { 
                httpOnly: true, 
                maxAge: 2 * 60 * 60 * 1000
            });
            
            res.redirect('/current');
        } catch (error) {
            console.error('Error en registro:', error);
            res.redirect('/register?error=1');
        }
    }
);

router.post('/login',
    passport.authenticate('login', { 
        failureRedirect: '/login?error=1',
        session: false
    }),
    (req, res) => {
        try {
            let token = jwt.sign(
                { 
                    id: req.user._id, 
                    email: req.user.email,
                    role: req.user.role,
                    first_name: req.user.first_name,
                    last_name: req.user.last_name
                }, 
                process.env.JWT_SECRET || 'coderSecret', 
                { expiresIn: '2h' }
            );
            
            req.session.user = { 
                id: req.user._id, 
                email: req.user.email, 
                first_name: req.user.first_name 
            };
            
            res.cookie('token', token, { 
                httpOnly: true, 
                maxAge: 2 * 60 * 60 * 1000
            });
            
            res.redirect('/current');
        } catch (error) {
            console.error('Error en login:', error);
            res.redirect('/login?error=1');
        }
    }
);

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send({ error: 'Error al cerrar sesión' });
        }
        res.clearCookie('token');
        res.redirect('/login');
    });
});

router.get('/current', passportCall('jwt'), (req, res) => {
    res.render('current', { 
        title: 'Usuario Actual',
        user: req.user 
    });
});

export default router;