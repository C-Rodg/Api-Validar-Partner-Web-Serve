const Promise = require('bluebird');
const request = require('request');
const {username, password, eventguid} = require('./xml.js');
let { registrantArray } = require('./xml.js');

let successfullPushes = 0;
const headers = {'Content-Type' : 'text/xml; charset=utf-8', 'SOAPAction' : 'https://VALIDAR.ENDPOINT/PutRegistrationData', 'Accept' : 'text/xml'};
const url = 'https://VALIDAR.ENDPOINT.com/';
const requestStart = `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
						<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
						    <soap:Header>
						        <AuthenticationSoapHeader xmlns="https://VALIDAR.ENDPOINT.com/">
						            <Username>${username}</Username>
						            <Password>${password}</Password>
						        </AuthenticationSoapHeader>
						    </soap:Header>
						    <soap:Body>
						        <PutRegistrationData xmlns="https://VALIDAR.ENDPOINT.com/">
						            <eventGuid>${eventguid}</eventGuid>
						            <data><![CDATA[`;
const requestEnd = `]]></data>
        </PutRegistrationData>
    </soap:Body>
</soap:Envelope>`;

function analyzeArray() {
	return new Promise((resolve, reject) => {
		if(registrantArray){
			console.log("Planning to make " + registrantArray.length + " requests.");
			resolve();
		}
		reject("Registrant array is empty.");
	});
}

function pushToEvent() {
	return new Promise((resolve, reject) => {
		let body = requestStart + registrantArray[0] + requestEnd;
		request({method: 'POST', headers : headers, uri : url, body}, (err, response, body) => {
			if(!err && response.statusCode == 200) {
				if(body.indexOf('&lt;Success&gt;true&lt;/Success&gt;&lt;') > -1){
					successfullPushes += 1;
					console.log('Successfully Pushed ' + successfullPushes);
					registrantArray.shift();
					if(registrantArray.length > 0) {
						return resolve(pushToEvent());
					} else {
						return resolve("ALL PUSHES COMPLETE");
					}				
				} else {
					reject("ERROR:\n" + body);
				}														
			}
			return reject("ERROR:\n" + body);
		});
	});
}

analyzeArray().then(() => {
	return pushToEvent();
}).then((result) => {
	console.log(result);
}).catch((err) => {
	console.log(err);
});