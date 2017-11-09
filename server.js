var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var User = require('./models/users.js');
var Devices = require('./models/devices.js');
var EventObj = require('./models/eventsObj.js');
// var resistorRead = require('./models/resistorRead.js');

var app = express();

// socket.oo
var server = require('http').createServer(app);  
var io = require('socket.io')(server);

// particle
var Particle = require('particle-api-js');
var particle = new Particle();

var token;
var myDevice = '1e0024001047343438323536';

// twitter
var Twitter = require('twitter');

//connection app twitter
var keys = {
    consumer_key: '1QFT4Q3sTFiJU2nK3MoS0ptoC',
    consumer_secret: 'fRBydzkpGAPV11oAPuTajJsitXsJkFMXXFKKmvP1m92y5RBs5Q',
    access_token_key: '258522301-GSh65xHxg1BwgDxPUAUyo9ByrCZKGjNz022w0fZC',
    access_token_secret: 'TR3MXqYRFheN8BhFsSvMbVUBkvCCfrpD5BGqegDNI8dmH'
};

//on instancie un nouvel objet Twitter avec la connection
var client = new Twitter(keys);



// j'instance la connection mongo 
promise = mongoose.connect('mongodb://localhost:27017/TestFinalJs', {
    useMongoClient: true,
});
console.log(promise.status);

// quand la connection est réussie
promise.then(
    () => {
        server.listen(3000, function() {
            console.log('listening on 3000 and database is connected');
        });   
    },
    err => {
        console.log('MONGO ERROR');
        console.log(err);
    }

);

//bodyparser
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.use('/app',express.static('./app'));


// display index.html
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html')
});

// API utilisateurs: 

// send user list
app.get('/user/list', function(req, res) {
    User.find({}, function(err, collection) {
        if (err) {
            console.log(err);
            res.send(500);
        } else {
            res.send(collection);
        }
    });

});

// send unique user 
app.get('/user/list/:id', function(req, res) {
    
    User.findOne({
        "_id": req.params.id
    }, function(err, monobject) {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            res.send(monobject);
        }
    });

});

// add user
app.post('/user/list', function(req, res) {
    
    var userToSave = new User(req.body);

    userToSave.save(function(err, success){
        if(err){
            console.log(err);
        }
        else{
            res.send(success);
        }
    });
    
});
// delete user by _id
app.delete('/user/list/:id', function(req, res) {

    User.findByIdAndRemove(req.params.id,function(err, response){
        if(err){
            console.log(err);
            res.status(500);
        }
        else{
            res.status(200);
        }
    });
});

// update user by _id
app.put('/user/list/:id', function(req, res) {
    
    User.findByIdAndUpdate(req.params.id,req.body, { new: true }, function (err, userUpdated) {
      if (err) return handleError(err);
      res.status(200).send(userUpdated);
    });

});

// API Device

// return Device parameters by id
app.get('/devices/:id', function(req,res){
    
    Devices.findOne({'_id':req.params.id},function(err,collection){
        if(err){
            console.log(err);
            return res.status(500);
        }
        else {
            res.send(collection);
        }
    });
});

// return all devices
app.get('/devices', function(req,res){

    Devices.find(function(err, collection) {
        if (err) {
            console.log(err);
            return res.send(500);
        } else {
            res.send(collection);
        }
    });
});

// send last 10 events
app.get('/event',function(req,res){

    EventObj.find({},null,function(err,collection){
        if(err){
            console.log(err);
            return res.send(500);
        }else{
            console.log(collection);
            res.send(collection);
        }
    }).limit(10);
});

/*
    A REVOIR
*/
// change led status
app.post('/event', function(req,res){
    
    var device = {};
    console.log(token)
    // var fnPr = particle.callFunction({ deviceId: myDevice, name: 'light', argument: 'D0:LOW', auth: token });
     
    particle.callFunction({ deviceId: myDevice, name: 'ledstatus', argument: '', auth: token })
        .then(function(data) {

            console.log('data :' + data)
            if( data.body.return_value == '1' ) {
                device.status = 'allumée';
            }
            else {
                device.status = 'éteinte';
            }
            res.send(device);
            io.emit('ledStatus',data.body.return_value);
        }, 
        function(err) {
            console.log('err :' + err);
            res.status(500);
            res.send(err);
        });
});

// Particle

particle.login({username:'paskal.jung@gmail.com',password:'tetete57'}).then(
    function(data){
        
        token = data.body.access_token;
        console.log(token);
        var devicesPr = particle.listDevices({ auth: token });

        devicesPr.then(
            function(devices){
                
                devices.body.forEach(function(device){
                    
                    Devices.findOne({"id":device.id}, function(err,objet){
                        if(objet) {
                            // if device exists, device updated
                            var dateActu = new Date();
                            var toUpdate = new Devices(objet);
                            toUpdate.last_heard = dateActu.toISOString();
                            Devices.findByIdAndUpdate(objet._id,toUpdate,{new:true}, function(err,objet){
                                if(err){
                                    console.log('Update Error ' + err);
                                }else{
                                    console.log('Device updated');

                                }
                            });

                        }
                        else if(err) {
                            // if error
                            console.log('Error '+ err);
                        }
                        else { 
                            // if new device
                            var toSave = new Devices(device);
                            toSave.save(function(err,success){
                                if(err){
                                    console.log('Add Error '+ err);
                                }else{
                                    console.log('Device added');
                                }
                            });
                        }
                    })
                
                });
            },
            function(err) {
                console.log('List devices call failed: ', err);
            }
        );


        particle.getEventStream({ deviceId: myDevice,name: 'beamStatus', auth: token }).then(function(stream) {
        
           stream.on('event', function(data) {
                
                var toSave = new EventObj(data);
                
                toSave.save(function(err,success){
                    if(err){
                        console.log('Add event Error ' + err);
                    }else{
                        io.emit('newEvent',success);
                    }
                });
            });
        });


        particle.getEventStream({ deviceId: myDevice,name: 'Intensity', auth: token }).then(function(stream) {
        
            stream.on('event', function(data) {
                
                var toSave = new EventObj(data);
                
                toSave.save(function(err,success){
                    if(err){
                        console.log('Add event Error ' + err);
                    }else{
                        io.emit('newEvent',success);
                        io.emit('Intensity',success);
                    }
                });
            });
        });

    },
    function(err){
        console.log('Could not login '+ err);
    }
);

// Twitter 

client.stream('statuses/filter', {track: 'particlelightoff'}, function(stream){

    stream.on('data', function (obj) {

        console.log(obj)

        io.sockets.emit('newTwit', obj);
        
        var fnPr = particle.callFunction({ deviceId: myDevice, name: 'light', argument: 'D0:LOW', auth: token });
    
        fnPr.then(
            function(data) {
                console.log(data);
                io.sockets.emit('ledStatus', {status: 'éteinte' });
            }, function(err) {
                console.log(err);
                console.log('An error occurred');
                //io.sockets.emit('ledStatus', {status: 'erreur' });
            }
        );

    });

    stream.on('error', function (error) {
        console.log('error', error);
    });
});


client.stream('statuses/filter', {track: 'particlelighton'}, function(stream){

    stream.on('data', function (obj) {

        console.log(obj)

        io.sockets.emit('newTwit', obj);
        
        var fnPr = particle.callFunction({ deviceId: myDevice, name: 'light', argument: 'D0:HIGH', auth: token });
    
        fnPr.then(
            function(data) {
                console.log(data);
                io.sockets.emit('ledStatus', { status: 'allumée' });
            }, function(err) {
                console.log('An error occurred');
            }
        );

    });

    stream.on('error', function (error) {
        console.log('error', error);
    });
});

