import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verificar configuración
transporter.verify(function(error, success) {
    if (error) {
        console.error('Error en configuración de email:', error);
    } else {
        console.log('✓ Servidor de email listo para enviar mensajes');
    }
});

export const sendPasswordResetEmail = async (email, token) => {
    const resetLink = `${process.env.BASE_URL}/reset-password/${token}`;
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Recuperación de Contraseña',
        html: `
            <h2>Recuperación de Contraseña</h2>
            <p>Has solicitado recuperar tu contraseña.</p>
            <p>Haz clic en el siguiente botón para restablecer tu contraseña:</p>
            <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
                Restablecer Contraseña
            </a>
            <p>Este enlace expirará en 1 hora.</p>
            <p>Si no solicitaste este cambio, ignora este correo.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Error enviando email:', error);
        return { success: false, error };
    }
};

export const sendPurchaseConfirmation = async (email, ticket) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Confirmación de Compra',
        html: `
            <h2>¡Gracias por tu compra!</h2>
            <p>Código de ticket: <strong>${ticket.code}</strong></p>
            <p>Fecha: ${new Date(ticket.purchase_datetime).toLocaleString()}</p>
            <p>Monto total: $${ticket.amount}</p>
            <h3>Productos:</h3>
            <ul>
                ${ticket.products.map(p => `
                    <li>${p.product.title || 'Producto'} - Cantidad: ${p.quantity} - Precio: $${p.price}</li>
                `).join('')}
            </ul>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Error enviando email:', error);
        return { success: false, error };
    }
};
