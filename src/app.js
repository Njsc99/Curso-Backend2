import path from 'path';
import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import { engine } from 'express-handlebars';
import mongoose from "mongoose";

import sessionsRouter from "./routes/api/sessions.js";
import viewsRouter from "./routes/views.js";
import initializePassport from "./config/passport.config.js";
import { __dirname } from "./utils.js";

const app = express();

// Middlewares básicos
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser("s3cr3t0"));

// Configuración de sesión
app.use(session({
    secret: "s3cr3t0",
    resave: false,
    saveUninitialized: false
}));

// Configuración de Handlebars
app.engine('handlebars', engine({
    extname: '.handlebars',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts')
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

initializePassport();
app.use(passport.initialize());
app.use(passport.session());

// Rutas
app.use('/', viewsRouter);
app.use('/api/sessions', sessionsRouter);

export default app;