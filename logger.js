var lastpi = null;
var fs = require('fs');
var firstrun = true;

getPIdata();

setInterval(function(){
	getPIdata();
},300000);

function getPIdata () {
	try {
  	var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
  	var oReq = new XMLHttpRequest();
  	oReq.addEventListener("load", pilistener);
  	oReq.open("GET", "https://www.predictit.org/api/marketdata/all/");
  	oReq.send();
	}
	catch (err) {
		console.log("error getting dem nom");
	}
}

//Scans the API call.
function pilistener () {
	var mydata = JSON.parse(this.responseText);
	var json = this.responseText;
	if (lastpi == null)
	{
		lastpi = mydata;
    console.log("initial loop");
		return;
	};

	//Write File
	var d = new Date();
	d = d.getFullYear() + "" + ((d.getMonth() + 1) > 9 ? (d.getMonth() + 1) : ("0" + (d.getMonth() + 1))) + (d.getDate() > 9 ? d.getDate() : ("0" + d.getDate())) + (d.getHours() > 9 ? d.getHours() : ("0" + d.getHours())) + (d.getMinutes() > 9 ? d.getMinutes() : ("0" + d.getMinutes()));
	fs.writeFile("./datastore/" + d + '.json', json, function(err) { //set to local datapath
    if (err) throw err;
    console.log('complete');
	});

	//initmasterlist(mydata);

	//check for changes
	if (mydata.markets.length != lastpi.markets.length)
	{
		console.log("Markets added or removed. Updating.")
		updatemasterlist(mydata);
		return;
	}
	for (increment in mydata.markets)
	{
		if (lastpi.markets[increment].id != mydata.markets[increment].id)
		{
			console.log("Market changed");
			updatemasterlist(mydata);
			return;
		}
		if (mydata.markets[increment].contracts.length != lastpi.markets[increment].contracts.length)
		{
			console.log("Contracts in " +mydata.markets[increment].name  + " have changed." );
			updatemasterlist(mydata);
			return;
		}
		/* Useless at the moment, will hit too many false positives.
		for (innerinc in mydata.markets[increment].contracts) //Potentially useless
		{
				if (mydata.markets[increment].contracts[innerinc].id != lastpi.markets[increment].contracts[innerinc].id)
				{
						console.log("contracts changed");
						updatemasterlist(mydata);
				}
		}
		*/
	}
	if (firstrun == true)
	{
		updatemasterlist(mydata);
		firstrun = false;
	}

	lastpi = mydata; // FINAL LINE
};

//loop through each item in list and see if its contained in masterlist
function updatemasterlist(mydata)
{
	var content;
	fs.readFile("./datastore/masterlist.json", function read(err, data) {
		content = data;
		comparemasterlist(mydata, content);
	});
};

function comparemasterlist(mydata, finaldata)
{
	finaldata = JSON.parse(finaldata);
	var containid = 0;
	var innercontainId = 0;
	console.log("comparing");
	for (increment in mydata.markets)
	{
		containid = -1;
		for (masterinc in finaldata.markets)
		{
			if (mydata.markets[increment].id == finaldata.markets[masterinc].id)
			{
				containid = masterinc;
				break;
			};
		};
		if (containid == -1)
		{
				finaldata.markets.push(addTo(mydata.markets[increment]));
				continue;
		}
		for (innerinc in mydata.markets[increment].contracts)
		{
			innercontainId = 0;
			for (masterinc in finaldata.markets[containid].contracts)
			{
					if (mydata.markets[increment].contracts[innerinc].id == finaldata.markets[containid].contracts[masterinc].id)
						{
									innercontainId = 1;
						}
			}
			if (innercontainId == 0)
			{
				finaldata.markets[containid].contracts.push(addTo(mydata.markets[increment].contracts[innerinc]));
			};
		}
	}
	finaldata = JSON.stringify(finaldata, null, 4);
	fs.writeFile("./datastore/masterlist.json", finaldata, function(err) { //set to local datapath
		if (err) throw err;
		console.log('complete update');
	});
};

function addTo(contract)
{
	var innertemp = {};
	var finalized;
	var d = new Date();
	d = (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear();
	if (contract.url == undefined)
	{
			console.log("Contract being added");
			finalized = JSON.stringify({
				id: contract.id,
				dateFound: d,
				name: contract.name
			});
			finalized = JSON.parse({finalized});
	}
	else {
		console.log("market being added");
		finalized = JSON.stringify({
			id: contract.id,
			name: contract.name,
			url: contract.url,
			dateFound: d,
			dateEnd: "NA",
			contracts: [],
			status: contract.status,
			resolved: "NA"
			});
			finalized = JSON.parse(finalized);
			for (innerinc in contract.contracts)
			{
				innertemp = JSON.stringify({
						id: contract.contracts[innerinc].id,
						dateFound: d,
						name: contract.contracts[innerinc].name
				});
				innertemp = JSON.parse(innertemp);
				finalized.contracts.push(innertemp);
		};
	}
	console.log(finalized);
	return finalized;
};
	//initialize masterlist
function initmasterlist(mydata)
{
	var	masterlist = JSON.stringify({markets: []});
	var temp = {};
	var constore = [];
	var innertemp = "";
	var d = new Date();
	d = (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear();
	for (increment in mydata.markets)
	{
			temp = JSON.stringify({
			id: mydata.markets[increment].id,
			name: mydata.markets[increment].name,
			url: mydata.markets[increment].url,
			dateFound: d,
			dateEnd: "NA",
			contracts: [],
			status: mydata.markets[increment].status,
			resolved: "NA"
			});
			temp = JSON.parse(temp);
			for (innerinc in mydata.markets[increment].contracts)
			{
				innertemp = JSON.stringify({
						id: mydata.markets[increment].contracts[innerinc].id,
						dateFound: d,
						name: mydata.markets[increment].contracts[innerinc].name
				});
				innertemp = JSON.parse(innertemp);
				temp.contracts.push(innertemp);
			}

			masterlist = JSON.parse(masterlist);
			masterlist.markets.push(temp);
			masterlist = JSON.stringify(masterlist, null, 4);
	}
	fs.writeFile("./datastore/masterlist.json", masterlist, function(err) { //set to local datapath
    if (err) throw err;
    console.log('complete v2');
	});
};
