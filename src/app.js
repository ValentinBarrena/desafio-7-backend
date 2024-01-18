import express from 'express'
import mongoose from 'mongoose'
import handlebars from 'express-handlebars'
import {Server} from "socket.io"
import cookieParser from 'cookie-parser'
import session from 'express-session'
import FileStore from 'session-file-store'
import MongoStore from 'connect-mongo'
import passport from 'passport'

import { __dirname } from './utils.js'
import viewsRouter from './routes/views.routes.js'
import productsRouter from './routes/products.routes.js'
import usersRouter from './routes/users.routes.js'
import cartsRouter from './routes/carts.routes.js'
import ordersRouter from './routes/orders.routes.js'
import cookiesRouter from './routes/cookies.routes.js'
import authRouter from './routes/auth.routes.js'
import MongoSingleton from './dao/mongo.singleton.js'
import config from './config.js'

try {
    MongoSingleton.getInstance()
    
    const app = express()
    const httpServer = app.listen(config.PORT, () => {
        console.log(`Backend activo puerto ${config.PORT}`);

        // Ver función de ejemplo en utils.js que dispara el exit.
        process.on('exit', code => {
            switch (code) {
                case -4:
                    console.log('Proceso finalizado por argumentación inválida en una función');
                    break;
                
                default:
                    console.log(`El proceso de servidor finalizó (err: ${code})`);
            }
        })

        process.on('uncaughtException', exception => {
            console.error(exception.name);
            console.error(exception.message);
        });
    })
    
    const socketServer = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["PUT", "GET", "POST", "DELETE", "OPTIONS"],
            credentials: false
        } 
    })
    socketServer.on('connection', socket => {
        socket.on('new_message', data => {
            socketServer.emit('message_added', data)
        })
    })

    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    app.use(cookieParser('secretKeyAbc123'))
    
    const fileStorage = FileStore(session)
    app.use(session({
        store: MongoStore.create({ mongoUrl: config.MONGOOSE_URL, mongoOptions: {}, ttl: 200, clearInterval: 5000 }), 
        secret: 'secretKeyAbc123',
        resave: false,
        saveUninitialized: false
    }))

    app.use(passport.initialize())
    app.use(passport.session())

    app.engine('handlebars', handlebars.engine())
    app.set('views', `${__dirname}/views`)
    app.set('view engine', 'handlebars')
    app.set('socketServer', socketServer)

    app.use('/', viewsRouter)
    app.use('/api/products', productsRouter)
    app.use('/api/users', usersRouter)
    app.use('/api/carts', cartsRouter)
    app.use('/api/orders', ordersRouter)
    app.use('/api/cookies', cookiesRouter)
    app.use('/api/auth', authRouter)

    app.use('/static', express.static(`${__dirname}/public`))
} catch(err) {
    console.log(`Backend: error al inicializar (${err.message})`)
}