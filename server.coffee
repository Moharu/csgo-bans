appPort = process.env.PORT || 3333

# express server
express = require 'express'
app = express()

app.set 'views', './views'
app.set 'view engine', 'jade'
app.use express.static('public')

app.get '/', (req, res) ->
    renderOptions =
        title: 'Csgo bans'
        url: 'ws://localhost:3334'
    res.render 'index', renderOptions

server = require('http').createServer(app)
server.listen appPort

# ==========================================

# websocket server
wsServer = require('ws').Server
websocketServer = new wsServer(server: server)
bannedMaps = []
websocketServer.on 'connection', (ws) ->
    ws.on 'message', (msg) ->
        msg = JSON.parse msg
        if msg.type is 'banMap'
            mapIndex = bannedMaps.indexOf msg.map
            if mapIndex is -1
                bannedMaps.push msg.map
            else
                bannedMaps.splice mapIndex, 1
        mapList = JSON.stringify({type: 'refreshMaps', bannedMaps: bannedMaps})
        websocketServer.clients.forEach (client) ->
            client.send mapList
    ws.on 'close', ->
        bannedMaps = []
        closeMessage = JSON.stringify type: 'getCurrent'
        websocketServer.clients.forEach (client) ->
            client.send closeMessage

