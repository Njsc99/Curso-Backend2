import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { passportCall } from '../../utils.js';

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
    // Genera el token
    let token = jwt.sign(
        { 
            id: req.user._id, 
            email: req.user.email,
            role: req.user.role,
            first_name: req.user.first_name,
            last_name: req.user.last_name
        }, 
        'coderSecret', 
        { expiresIn: '2h' }
    );
    
    const { password, ...safeUser } = req.user.toObject ? req.user.toObject() : req.user;
    req.session.user = { id: req.user._id, email: req.user.email, first_name: req.user.first_name };
    
    // ✅ Envía el token como cookie
    res.cookie('token', token, { 
        httpOnly: true, 
        maxAge: 2 * 60 * 60 * 1000 // 2 horas
    });
    
    // ✅ Si es petición desde formulario HTML, redirige
    if (req.accepts('html')) {
        return res.redirect('/current');
    }
    
    // Si es API, devuelve JSON
    res.send({ 
        status: "success", 
        payload: safeUser, 
        token 
    });
  }
);

// ✅ Ruta /current - devuelve el usuario autenticado
router.get('/current', passportCall('jwt'), (req, res) => {
    res.json({ 
        status: "success",
        user: req.user 
    });
})

router.get('/faillogin', (req, res) => { res.status(400).send("Login fallido"); });

// ✅ Cambia POST a GET para que funcione con links <a>
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send({ error: 'Error al cerrar sesión' });
        }
        // ✅ Limpia la cookie del token JWT
        res.clearCookie('token');
        res.redirect('/login');
    });
});

// GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback', 
    passport.authenticate('github', { failureRedirect: '/login' }), 
    (req, res) => {
        req.session.user = req.user;
        res.redirect('/');
    }
);

export default router;