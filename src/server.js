const app = require('express')()
const http = require('http').Server()
const io = require('socket.io')(http)
const redis = require('socket.io-redis')
const { LocalStorage } = require('node-localstorage')
const pageUpdate = require('./page-actions/update')
const pageSync = require('./page-actions/sync')
const commentPost = require('./comment-actions/post')
const env = process.env.NODE_ENV || 'development'
const db = new LocalStorage(`./db.${env}`)
const dev = env === 'development'

if (dev) process.env.DEBUG = 'server'

io.adapter(redis({ host: 'localhost', port: 6379 }))

io.on('connection', socket => {
  socket.on('page/update', payload => pageUpdate(payload, db, socket))
  socket.on('page/sync', payload => pageSync(payload, db, io, socket.id))
  socket.on('comments/post', payload => commentPost(payload, db, io))
  socket.send('socket/connected', {
    message: '接続しました'
  })
})

http.listen(8080, () => console.log('listening on *:8080'))
