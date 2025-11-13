import { Router } from 'express';
import userModel from '../models/user.model.js';
import bcrypt from 'bcryptjs';

const router = Router()

//Endpoints
router.get('/', async (req, res) => {
    try {
        let users = await userModel.find();
        res.send({ result: "success", payload: users })
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: "error", error: "Server error" })
    }
})

// router.post('/', async (req, res) => {
//     try {
//         console.log('Headers:', req.headers);
//         console.log('POST /api/users body:', req.body); // <-- diagnóstico

//         let { first_name, last_name, email, age, password } = req.body;

//         if (!first_name || !last_name || !email || !age || !password) {
//             return res.status(400).send({ status: "error", error: "Parametros no definidos" })
//         }

//         const ageNumber = Number(age);
//         if (Number.isNaN(ageNumber)) {
//             return res.status(400).send({ status: "error", error: "Edad inválida" })
//         }

//         // Hashear la contraseña antes de guardar
//         const saltRounds = 10;
//         const hashedPassword = await bcrypt.hash(password, saltRounds);

//         let result = await userModel.create({ first_name, last_name, email, age: ageNumber, password: hashedPassword });
//         res.status(201).send({ result: "success", payload: result })
//     } catch (error) {
//         console.log(error);
//         if (error.name === 'ValidationError') {
//             return res.status(400).send({ status: "error", error: error.message })
//         }
//         if (error.code === 11000) {
//             return res.status(409).send({ status: "error", error: "Email ya registrado" })
//         }
//         res.status(500).send({ status: "error", error: "Server error" })
//     }
// })

// Cambiar POST público por uno protegido (ejemplo)
router.post('/', (req, res) => {
  // NO usar esto para registro público si usas Passport
  return res.status(403).send({ error: 'Registro deshabilitado. Usa /api/sessions/register' });
})

router.put('/:uid', async (req, res) => {
    let { uid } = req.params;

    let userToReplace = req.body;

    if (!userToReplace.first_name || !userToReplace.last_name || !userToReplace.email) {
        res.send({ status: "error", error: "Parametros no definidos"})
    }
    let result = await userModel.updateOne({_id: uid }, userToReplace)
})

router.delete('/:uid', async (req, res) => {
    let { uid } = req.params;
    let result = await userModel.deleteOne({ _id: uid});
    res.send({ result: "success", payload: result})
})

export default router;