const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const dash_button = require('node-dash-button');
const dash = dash_button(process.env.DASH_MAC, null, 1000, 'all');
const fs = require('fs');
const request = require('request');
const secureCamUrl = process.env.CAM_URL;
const AWS = require('aws-sdk');
const bucketName = process.env.BUCKET_NAME;
const ifttt_url = process.env.IFTTT_URL;
const moment = require('moment');

AWS.config.loadFromPath(path.resolve(__dirname, 'aws-credentials.json'));

const s3 = new AWS.S3({signatureVersion: 'v4'});
var s3Bucket = new AWS.S3({ params: { Bucket: bucketName } })

function download(uri, file) {
	return new Promise(function (resolve, reject) {
		request.head(uri, function (err, res, body) {
			if (err) {
				reject(err)
			} else {
				request(uri).pipe(fs.createWriteStream(path.resolve(__dirname, file))).on('close', async () => {
					let tmpFile = await readFileAsync(path.resolve(__dirname, file));
					resolve(tmpFile);
				})
			}
		});
	})
	.catch(e => {
		return e;
	});
};

function readFileAsync(path) {
	return new Promise(function (resolve, reject) {
		fs.readFile(path, function (error, result) {
			if (error) {
				reject(error);
			} else {
				resolve(result);
			}
		});
	})
	.catch(e => {
		return e;
	});
};

function unlinkFileAsync(path) {
	return new Promise(function (resolve, reject) {
		fs.unlink(path, function (error) {
			if (error) {
				reject(error);
			} else {
				resolve(true);
			}
		});
	})
	.catch(e => {
		return e;
	});
}

function putObjectAndGetSignedUrlAsync(key, body, contentType) {
	return new Promise(function (resolve, reject) {
		s3Bucket.putObject({
			Key: key,
			Body: body,
			ContentType: contentType
		}, async function (error, res) {
			if (error) {
				reject(error);
			} else {
				var params = { Bucket: bucketName, Key: key, Expires: 3600 };
				let url = s3.getSignedUrl('getObject', params);
				resolve(url);
			}
		});
	})
	.catch(e => {
		return e;
	});
};

dash.on("detected", async function () {

	try {
		console.log("found button");

		// create new filename
		var dateTime = new Date();
		now = moment(dateTime).format("YYYY-MM-DD HH-mm-ss");

		let filename = now + ".png";
		let file = 'tmp/' + filename;

		// get latest image from picam
		tempFile = await download(secureCamUrl, file);

		// get signed S3 url
		signedUrl = await putObjectAndGetSignedUrlAsync(filename, tempFile, 'image/png');
		console.log(signedUrl);

		// remove .tmp file
		await unlinkFileAsync(file);

		// send IFTTT notification
		request(ifttt_url, {
			method: 'POST',
			json: true,
			body: {
				value1: signedUrl
			}
		});
	}
	catch (e) {
		console.log(e);
	}
});

module.exports = {
	download: download,
	readFileAsync: readFileAsync,
	unlinkFileAsync: unlinkFileAsync,
	putObjectAndGetSignedUrlAsync: putObjectAndGetSignedUrlAsync
}

