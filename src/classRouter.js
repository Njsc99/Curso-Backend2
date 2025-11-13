import express from 'express'
import dotenv from 'dotenv'
import config from './config/config.js'


const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

class UserRouter {
    constructor() {
        this.router = express.Router()
        this.router.use(this.middleware)
        this.router.get("/", this.getHomePage)
        this.router.get("/perfil", this.getProfile)
        this.router.get("/configuracion", this.getSettings)
    }

    middleware(req, res, next) {
        console.log("Middleware de usuarios")
        next()
    }

    getHomePage(req, res) {
        res.send("Pagina de inicio")
    }

    getProfile(req, res) {
        res.send("Perfil del usuario")
    }

    getSettings(req, res) {
        res.send("Configuraciones del usuario")
    }
}

const userRouter = new UserRouter()

app.use("/usuarios", userRouter.router)

app.listen(3000, () => {
    console.log("Servidor escuchando en el puerto 3000")
})