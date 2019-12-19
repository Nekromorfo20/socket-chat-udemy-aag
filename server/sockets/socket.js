const { io } = require('../server');
const { Usuarios } = require('../classes/usuarios')
const { crearMensaje } = require('../utilidades/utilidades')
const usuarios = new Usuarios()

//El objeto client contiene varios parametros, entre ellos el id que es unico por sesion
io.on('connection', (client) => {

    client.on('entrarChat', (data, callback) => {

        if(!data.nombre || !data.sala){
            return callback({
                error: true,
                mensaje: 'El nombre/sala es necesario'
            })
        }

        client.join(data.sala)

        usuarios.agregarPersona(client.id, data.nombre, data.sala)

        client.broadcast.to(data.sala).emit('listaPersonas', usuarios.getPersonaPorSala(data.sala))

        callback(usuarios.getPersonaPorSala(data.sala))
    })

    client.on('crearMensaje', (data) => {
        let persona = usuarios.getPersona(client.id)

        let mensaje = crearMensaje(persona.nombre, data.mensaje)
        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje)
    })

    client.on('disconnect', () => {
        let personaBorrada = usuarios.borrarPersona(client.id)

        client.broadcast.to(personaBorrada.sala).emit('crearMensaje', crearMensaje('Administrador', `${ personaBorrada.nombre } salió`))

        client.broadcast.to(personaBorrada.sala).emit('listaPersonas', usuarios.getPersonaPorSala())

    })

    client.on('mensajePrivado', data => {
        let persona = usuarios.getPersona(client.id)
        client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje) )
    })

});