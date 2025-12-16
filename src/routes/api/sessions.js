import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { passportCall } from '../../utils.js';
import dotenv from 'dotenv';
import crypto from 'crypto';
import UserRepository from '../../repositories/user.repository.js';
import UserDTO from '../../dto/user.dto.js';
import passwordResetModel from '../../models/passwordReset.model.js';
import { sendPasswordResetEmail } from '../../utils/mailer.js';
import { isValidPassword } from '../../utils.js';

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
    // Usar DTO para no exponer información sensible
    const userDTO = new UserDTO(req.user);
    
    res.json({ 
        status: "success",
        message: "Usuario autenticado correctamente",
        payload: userDTO
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

// Solicitar recuperación de contraseña
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        const user = await UserRepository.getUserByEmail(email);
        if (!user) {
            return res.status(200).json({ 
                status: "success", 
                message: "Si el correo existe, recibirás un enlace de recuperación" 
            });
        }

        // Generar token único
        const token = crypto.randomBytes(32).toString('hex');
        
        // Guardar token en BD con expiración de 1 hora
        await passwordResetModel.create({
            userId: user._id,
            token,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000)
        });

        // Enviar email
        await sendPasswordResetEmail(email, token);

        res.json({ 
            status: "success", 
            message: "Si el correo existe, recibirás un enlace de recuperación" 
        });
    } catch (error) {
        console.error('Error en forgot-password:', error);
        res.status(500).json({ status: "error", message: "Error al procesar la solicitud" });
    }
});

// Restablecer contraseña
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        // Buscar token válido
        const resetToken = await passwordResetModel.findOne({ 
            token, 
            used: false,
            expiresAt: { $gt: new Date() }
        });

        if (!resetToken) {
            return res.status(400).json({ 
                status: "error", 
                message: "Token inválido o expirado" 
            });
        }

        // Obtener usuario
        const user = await UserRepository.getUserById(resetToken.userId);
        
        // Verificar que la nueva contraseña no sea igual a la anterior
        if (isValidPassword(user, newPassword)) {
            return res.status(400).json({ 
                status: "error", 
                message: "La nueva contraseña no puede ser igual a la anterior" 
            });
        }

        // Actualizar contraseña
        await UserRepository.updatePassword(resetToken.userId, newPassword);

        // Marcar token como usado
        resetToken.used = true;
        await resetToken.save();

        res.json({ 
            status: "success", 
            message: "Contraseña actualizada correctamente" 
        });
    } catch (error) {
        console.error('Error en reset-password:', error);
        res.status(500).json({ status: "error", message: "Error al restablecer contraseña" });
    }
});

export default router;