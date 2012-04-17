
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , WebSocketServer = require('ws').Server

var app = module.exports = express.createServer()
  , wss = new WebSocketServer({server:app})


// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.get('/get_user_media', routes.get_user_media);
app.get('/peerconnection', routes.peerconnection);

// websocket
var clients = [];

wss.on('connection', function(ws) {
  clients.push(ws);
  console.log("connected");

  ws.on('message', function(data) {
    console.log('receive message');

    // relay message to another peer.
    for(var i = 0, l = clients.length; i < l; ++i ) {
      if( clients[i] !== ws ) {
         clients[i].send(data);
      }
    }
  });

  ws.on('close', function(){
    console.log('detect close event');
    clearInterval(timer);
    for( var i = 0, l = clients.length; i < l; i++ ) {
      if ( clients[i] === ws ) {
        console.log('found target instance');
        clients.splice(i, 1);

        break;
      }
    }
  });

  // logging ping/pong message
  ws.on('ping', function(){
    console.log('receive ping');
  })
  ws.on('pong', function(){
    console.log('receive pong');
  })

  var timer = setInterval(function(){
    console.log("send ping");
    ws.ping();
  }, 30000);

});

var port = process.env.VMC_APP_PORT || 3000;
app.listen(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
