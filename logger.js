var lastpi = null;
var fs = require('fs');

/*
setInterval(function(){
	getPIdata();
},300000);
*/

getPIdata();
getPIdata();

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
	}

	//Write File
	var d = new Date();
	d = d.getFullYear() + "" + (d.getMonth() + 1) + d.getHours() + d.getMinutes();
	fs.writeFile("C:\\Users\\thomp\\Desktop\\Discord Bot\\datastore\\" + d + '.json', json, function(err) { //set to local datapath
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


	lastpi = mydata; // FINAL LINE
};

//loop through each item in list and see if its contained in masterlist
function updatemasterlist(mydata)
{
	var content;
	fs.readFile("C:\\Users\\thomp\\Desktop\\Discord Bot\\datastore\\masterlist1.json", function read(err, data) {
		content = data;
		comparemasterlist(mydata, content);
	}
};

function comparemasterlist(mydata, finaldata)
{
	finaldata = JSON.parse(finaldata);
	for (increment in mydata.markets)
	{
		for (masterinc in finaldata.markets)
		{
			if ()

		}
		for (innerinc in mydata.markets[increment].contracts)
		{


		}

	}


}

function addTo(contract)
{


}
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
	fs.writeFile("C:\\Users\\thomp\\Desktop\\Discord Bot\\datastore\\masterlist1.json", masterlist, function(err) { //set to local datapath
    if (err) throw err;
    console.log('complete v2');
	});
};
