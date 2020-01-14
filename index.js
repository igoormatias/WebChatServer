const express = require ('express');
const socketio = require ('socket.io')
const http = require ('http')

const { addUser,removeUser,getUser,getUsesInRoom } = require('./users.js')

const PORT = process.env.PORT || 5000

const router = require('./routes');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on('connection', (socket) => {
 socket.on('join', ({name, room}, callback)=>{
        const { error, user } = addUser({id: socket.id, name, room});

        if (error) return callback(error)

        socket.emit('message', { user: 'admin', text: `${user.name}, Bem vindo a sala ${user.room}`});
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name}, Entrou no grupo!`})

        socket.join(user.room)

        callback();
    });

    socket.on('sendMessage', (message, callback)=>{
        const user = getUser(socket.id)

        io.to(user.room).emit('message', { user: user.name, text: message})

        callback();
    })
    socket.on('disconnect', () => {
        console.log('Usuário acabou de sair')

    })
});

app.use(router);

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));