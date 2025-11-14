import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { passportCall } from '../../utils.js';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

router.post('/register',
  passport.authenticate('register', { failureRedirect: '/api/sessions/failregister' }),
  (req, res) => { res.send({ status: "success", message: "Usuario registrado" }) }
);

router.get('/failregister', (req, res) => {
  console.log("Fallo en el registro");
  res.status(400).send({ error: "Failed register" });
});

router.post('/login',
  passport.authenticate('login', { failureRedirect: '/api/sessions/faillogin' }),
  (req, res) => {
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
    
    const { password, ...safeUser } = req.user.toObject ? req.user.toObject() : req.user;
    req.session.user = { id: req.user._id, email: req.user.email, first_name: req.user.first_name };
    
    res.cookie('token', token, { 
        httpOnly: true, 
        maxAge: 2 * 60 * 60 * 1000
    });
    
    if (req.accepts('html')) {
        return res.redirect('/current');
    }
    
    res.send({ 
        status: "success", 
        payload: safeUser, 
        token 
    });
  }
);

router.get('/current', passportCall('jwt'), (req, res) => {
    const userData = {
        id: req.user.id,
        email: req.user.email,
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        role: req.user.role
    };
    
    res.json({ 
        status: "success",
        message: "Usuario autenticado correctamente",
        payload: userData
    });
})

router.get('/faillogin', (req, res) => { res.status(400).send("Login fallido"); });

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send({ error: 'Error al cerrar sesión' });
        }
        res.clearCookie('token');
        res.redirect('/login');
    });
});

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback', 
    passport.authenticate('github', { failureRedirect: '/login' }), 
    (req, res) => {
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
        
        req.session.user = req.user;
        
        res.cookie('token', token, { 
            httpOnly: true, 
            maxAge: 2 * 60 * 60 * 1000
        });
        
        res.redirect('/current');
    }
);

export default router;