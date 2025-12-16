import mongoose from 'mongoose';
import dotenv from 'dotenv';
import UserRepository from './repositories/user.repository.js';
import ProductRepository from './repositories/product.repository.js';
import CartRepository from './repositories/cart.repository.js';

dotenv.config();

const seedDatabase = async () => {
    try {
        console.log('Conectando a MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/backend2');
        console.log('✓ Conectado a MongoDB');

        // Crear usuario admin
        console.log('\nCreando usuario admin...');
        const adminCart = await CartRepository.createCart();
        const admin = await UserRepository.createUser({
            first_name: 'Admin',
            last_name: 'Sistema',
            email: 'admin@example.com',
            age: 30,
            password: 'admin123',
            role: 'admin',
            cart: adminCart._id
        });
        console.log('✓ Usuario admin creado:', admin.email);

        // Crear usuario normal
        console.log('\nCreando usuario normal...');
        const userCart = await CartRepository.createCart();
        const user = await UserRepository.createUser({
            first_name: 'Usuario',
            last_name: 'Prueba',
            email: 'user@example.com',
            age: 25,
            password: 'user123',
            role: 'user',
            cart: userCart._id
        });
        console.log('✓ Usuario normal creado:', user.email);

        // Crear productos de ejemplo
        console.log('\nCreando productos...');
        const products = [
            {
                title: 'Laptop Dell',
                description: 'Laptop de alta gama con 16GB RAM',
                price: 1200,
                stock: 10,
                category: 'Electrónica',
                code: 'LAPTOP-001',
                owner: admin.email
            },
            {
                title: 'Mouse Logitech',
                description: 'Mouse inalámbrico ergonómico',
                price: 25,
                stock: 50,
                category: 'Accesorios',
                code: 'MOUSE-001',
                owner: admin.email
            },
            {
                title: 'Teclado Mecánico',
                description: 'Teclado mecánico RGB',
                price: 80,
                stock: 30,
                category: 'Accesorios',
                code: 'KEYBOARD-001',
                owner: admin.email
            },
            {
                title: 'Monitor Samsung 27"',
                description: 'Monitor Full HD 27 pulgadas',
                price: 300,
                stock: 15,
                category: 'Electrónica',
                code: 'MONITOR-001',
                owner: admin.email
            },
            {
                title: 'Auriculares Sony',
                description: 'Auriculares con cancelación de ruido',
                price: 150,
                stock: 25,
                category: 'Audio',
                code: 'HEADPHONES-001',
                owner: admin.email
            }
        ];

        for (const productData of products) {
            const product = await ProductRepository.createProduct(productData);
            console.log(`✓ Producto creado: ${product.title}`);
        }

        console.log('\n✓ Seed completado exitosamente!');
        console.log('\n=== Credenciales de prueba ===');
        console.log('Admin:');
        console.log('  Email: admin@example.com');
        console.log('  Password: admin123');
        console.log('\nUsuario:');
        console.log('  Email: user@example.com');
        console.log('  Password: user123');
        
        await mongoose.disconnect();
        console.log('\n✓ Desconectado de MongoDB');
    } catch (error) {
        console.error('Error en seed:', error);
        process.exit(1);
    }
};

seedDatabase();
