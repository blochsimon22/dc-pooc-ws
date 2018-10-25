const express = require('express')
const app = express()
const port = 3000

//Création et configuration d'un server dse websockets
const websocket = require('ws');
const wss = new websocket.Server({ port: 3030 });
var clients = [];
wss.on('connection', function connection(ws) {
	clients.push(ws);
	ws.on('message', function incoming(message) {
		console.log('received: %s', message);
	});
});
//ici on met des const
const Gpio = require('onoff').Gpio;
var sensor = new Gpio(17, 'in', 'both');

function exit() {
	sensor.unexport();
	process.exit();
}

//On initialise notre utilitaire node pour communiquer avec le capteur 
//(capteur = sensor en anglais)
const sensor = require('ds18b20');
//Identifiant de notre capteur, remplacez les X par ce que vous avez eu précédem$
const sensorId = '28-01131a3eb0d1';
//On lit la température en provenance du capteur.
var temperature = sensor.temperatureSync(sensorId);
//On affiche dans le terminal la température.
//console.log('La température est de ' + temperature);

//fonction pour envoyer du texte à tous les clients
function sendText(text) {
	for(index in clients) {
		clients[index].send(text);
	}
}

//Configuration de la console pour lire le clavier
const readline = require('readline');
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
process.stdin.on('keypress', (str, key) => {
	//On détecte le Ctrl-C pour stopper le serveur.
	if (key.ctrl && key.name === 'c') {
		process.exit();
	} else {
		//On envoie directement la touche reçue au client.
		sendText(str);
	}
});

//OS est un utilitaire node qui va nous servir à afficher le nom de notre raspberry
const os = require("os");
//MustacheExpress est notre moteur de template
const mustacheExpress = require('mustache-express');

//Configuration du moteur de template
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

//Ici on dit au serveur de servir les fichiers statiques depuis le dossier /public
app.use(express.static('public'))

//On retrouve le même comportement que notre serveur précédent
app.get('/', (request, response) => {
	//Ici on indique que nous voulons transformer notre fichier index.mustache en HTML
	response.render('index');
});

//ici on a mis le capteur de mouvement
sensor.watch(function (err, value) {
	if(err) exit();
	//Si le capteur détecte du mouvement 
	//On affiche 'Mouvement détecté'
	if(value == 1) {
		sendText('Mouvement détecté !');
	} else {
		sendText('fin du mouvement');
	}
});
	

app.listen(port, (err) => {
	if (err) {
		return console.log('Erreur du serveur : ', err)
  	}
	//On utilise l'utilitaire OS pour récupérer le nom de notre raspberry.
	console.log('Le serveur écoute sur le port '+port+'\nRendez vous sur http://'+os.hostname()+'.local:'+port);
	console.log('Tappez votre texte ici, il sera envoyé sur votre page web instantanément.');
});
