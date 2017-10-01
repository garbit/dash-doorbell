require('dotenv').config();
var dash_button = require('node-dash-button');
var dash = dash_button(process.env.DASH_MAC, 'wlan0', 1000, 'all');
const fs = require('fs');
const request = require('request');
const url = process.env.CAM_URL;
const AWS = require('aws-sdk');
const bucketName = process.env.BUCKET_NAME;
const ifttt_url = process.env.IFTTT_URL;

AWS.config.loadFromPath('aws-credentials.json');
var s3 = new AWS.S3();
var s3Bucket = new AWS.S3( { params: { Bucket: bucketName } } )

var download = function(uri, filename, callback){
    request.head(uri, function(err, res, body){
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};


dash.on("detected", function(){
	console.log("found button");
	download(url, 'test.png', function(){
   		fs.readFile('test.png', function (err, data) {
        		if (err) { throw err; }

        		s3Bucket.putObject({
            			Key: 'test.png',
            			Body: data,
				ContentType:'image/png'
        		}, function (res) {
            			var params = { Bucket: bucketName, Key: 'test.png', Expires: 3600 };

            			let url = s3.getSignedUrl('getObject', params);
	
				console.log(url);				

            			fs.unlink('test.png', function(error){
                			if(error)
                    				console.log("Error removing file");
                		request(ifttt_url, {
                    			method: 'POST',
                    			json: true,
                    			body: {
                        			value1: url
                    			}
                		});
            	});
        });
    });
});			
});

