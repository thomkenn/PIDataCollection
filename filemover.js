//take 1: see if we can move a file to the remote server

var client = require('scp2');
var fs = require('fs');

var serverconfig = {
    port: 22,
    host: '35.237.158.169',
    username: 'thompson134',
    privateKey: require("fs").readFileSync('./.ssh/id_rsa'),
    path: '/home/thompson134/datastore'
};



setInterval(function(){
fs.readdir( '/home/pi/datastore', (error, files) => { 
   let totalFiles = files.length; // return the number of files
   if (totalFiles >= 5)
   {
	   let name = '/home/pi/datastore/' + files[0];
	   console.log(name);
	   client.scp(name, serverconfig, (err) => {
		if (!err) {
			console.log('success');
			remove(name);
		}
})
   };
   console.log(totalFiles); // print the total number of files
});
}, 30000);

function remove(name) {
	fs.unlink(name, (err) => {
		if (err) throw err;
		console.log( name  + ' was deleted');
});
};


//client.upload('file.txt', '/home/thompson134/file.txt', function(err) { console.log("writing");});
/*
setTimeout(function(){
client.scp('file.txt', 'thompson134@35.237.158.169:.', function(err) {
	console.log("writing");
});
}, 5000);
*/