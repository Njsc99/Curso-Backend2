import { Router } from 'express';
import { passportCall } from '../utils.js';

const router = Router();

router.get('/', (req, res) => {
    res.render('home', { title: 'Inicio', mensaje: 'Bienvenido a Handlebars' });
});

router.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

router.get('/register', (req, res) => {
    res.render('register', { title: 'Registro' });
});

// ✅ Ruta /current con JWT
router.get('/current', passportCall('jwt'), (req, res) => {
    // Si llegamos aquí, req.user tiene el payload del JWT
    res.render('current', { 
        title: 'Usuario Actual',
        user: req.user 
    });
});

export default router;