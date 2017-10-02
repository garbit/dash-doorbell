# Dash-Doorbell
This project turns your Amazon Dash Button into an interactive doorbell that captures an image from your local MotionEyeOS webcam, alerts you with a chime, and sends you a push notification direct to your phone.

Each IFTTT push notification includes an S3 link to an image from your MotionEyeOS camera. All images are hosted securely via Amazon S3 and the project uses signed urls to prevent external access to your S3 bucket. Links also expire after 60 minutes to prohibit unwanted external access.

# Requirements
Dash-doorbell uses the following components:
- [Amazon Dash Button](https://aws.amazon.com/iotbutton/)
- [IFTTT.com](IFTTT.com)
- [AWS S3 Storage](https://aws.amazon.com/s3/)
- [MotionEyeOS](https://github.com/ccrisan/motioneyeos)

# Basic Usage
To start this project use:
```
npm install
sudo node index.js
```

This project uses forever and to start the script you must use sudo. See below for adding the forever command to crontab.

Start by editing your crontab
```
sudo crontab -e
```
Then add the following
```
@reboot /usr/bin/sudo /usr/local/bin/forever start /home/pi/Development/dash-doorbell/index.js
```

# Setup
Create an aws-credentials.json and .env file (see the example files in the repo for references to the parameters)

## .env
You need to edit the .env file and add the following keys:
```
CAM_URL=ENTER_MOTIONEYEOS_CAM_STILL_IMAGE_URL
IFTTT_URL=IFTTT_URL_HERE
DASH_MAC=MAC_ADDRESS_FOR_DASHBUTTON
BUCKET_NAME=AWS_S3_BUCKET_NAME
```

### CAM_URL (.env)
To obtain a [MotionEyeOS](https://github.com/ccrisan/motioneyeos) camera still image you need to do the following:

1. Sign into your local MotionEyeOS pi camera and click on the camera you wish to create the still from.
2. Open the side menu
3. Video Streaming > Snapshot URL
4. Copy this link and use it as the key for CAM_URL (.env)

### IFTTT_URL (.env)
To receive IFTTT notifications you'll need to create an account on [IFTT.com account](https://ifttt.com/)

1. Visit https://ifttt.com/create
2. Click on "This"
3. Select "Webhooks"
4. Select "Receive web request"
5. Enter the event name
6. Click "Create"
7. Click on "That"
8. Select "Notifications"
9. Select "Send a notification from the IFTTT app"
10. Past in the following: "Doorbell has been pressed {{Value1}}"
11. Click "Create Action"
12. Click "Finish"
13. Visit https://ifttt.com/maker_webhooks
14. Copy + paste the event url into the .env file (https://maker.ifttt.com/trigger/{event_name_you_set}/with/key/YOURUNIQUEKEY)
15. Install the IFTTT app on your phone and sign in.

### Get your dash Mac Address (.env)
To retrieve your dash mac address follow these instructions:
https://github.com/hortinstein/node-dash-button#find-a-dash

Paste in the mac address into the .env file
```
DASH_MAC=MAC_ADDRESS_FOR_DASHBUTTON
```

### BUCKET_NAME (.env)
Sign up to AWS and create a bucket. Paste the bucket URI into the .env file

Paste into BUCKET_NAME in the .env file:
```
BUCKET_NAME=http://BUCKETNAME.s3-AWS-REGION.amazonaws.com
```

## aws-credentials.json
You need to create an S3 bucket and a new user with access to that bucket (DONT USE YOUR ROOT ACCOUNT!).

The config file has the following parameters which can be obtained from the [AWS console](https://console.aws.amazon.com/iam/home):
```
{
    "accessKeyId": "YOUR_AWS_ACCESS_KEY_ID",
    "secretAccessKey": "YOUR_AWS_SECRET_ACCESS_KEY",
    "region": "AWS_REGION_OF_YOUR_BUCKET"
}
```

# Debian packages
Running this on a debian system (i.e. a Raspberry Pi) requires that you install the following packages:
```
sudo apt-get install alsa-base alsa-utils
```

# Min Node.js Requirements
Requires Node.js version 7 (async await)

