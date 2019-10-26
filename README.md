# **monitor-video-streams-api**

This service checks how many video streams a given user is watching and caps the number of concurrently viewable video streams to 3.

Front-end URL: https://leebenmorris.github.io/monitor-video-streams-api/

Back-end URL: https://monitor-video-streams-api.herokuapp.com

---

## Table of Contents

-   [Description](#description)
-   [Back-end](#back-end)
    -   [Scalingstrategy](#scaling-strategy)
-   [Front-end](#front-end)
-   [Deployment](#deployment)
    -   [Back-end](#deployment-back-end)
    -   [Front-end](#deployment-front-end)
-   [Building and running locally](#building-and-running-locally)
-   [Testing locally](#testing-locally)

---

## **Description**

The main focus of this project is the back-end server, but some effort has gone into building a simple front-end web page to demonstrate how the back-end works.

The back-end is hosted on Heroku. The front-end is a static site and is hosted on github pages. These services were chosen as they are free and easy to use, the main point being to demonstrate the real-time communication between the front- and back-end across the internet.

---

## **Back-end**

This is based around the idea that the server would not stream videos itself, but would allow the front end to access a list of videos to play which would then be hosted and streamed from elsewhere.

The back-end monitors the videos being played and only allows 3 video streams to be watched at any one time. It records the order in which the videos start playing and instructs the front-end to pause the 4th most recently played video, i.e. only the three most recently playing videos will remain playing.

To achieve this the front-end and back-end communicate in real time over a socket.io connection (the 'socket'). Once a socket has been opened, the front-end requests a list of videos to play then streams these videos from elsewhere (in this case YouTube).

Once loaded the videos are in a paused state. When the user starts to play a video the 'playing' event for that particular player is captured and sent to the back-end along with that player's unique id. The back-end keeps track of which videos are playing in a 'now-playing' list, and each user gets a unique list. When the now-playing list gets longer than 3, the 4th oldest player id is retrieved from the list and sent back to the front-end along with a 'pause video' command.

When a user disconnects from the server (by closing the web page) their now-playing list is deleted.

### **Scaling strategy**

Currently, a 'user' is a single instance of the front-end web page. Each instance of the web page creates a single socket connection and each connection automatically gets a unique 'socket id'. 'now-playing' events are grouped by this id on the server. Because of this basic structure, it would not be very difficult to add authentication in the future and swap out the socket id for a proper user id.

The now-playing list is currently kept in memory on the server. To scale, it would be necessary to add more server instances to handle the load. To ensure that the user data is available to each instance quickly it would be necessary to use an in-memory cache such as Redis. A vendor specific example of this is AWS's ElastiCache.

As this service is potentially long running, it might not make sense to run it on something like AWS Lambda as this has a 15 minute runtime cap. It could however be run in something like an AWS EC2 auto-scaling group, or perhaps in a Kubernetes cluster - basically any hosting service that allows long running API services and automatic horizontal scaling of service instances depending on load.

As the video streaming is not handled by this API, the specifics of scaling that are outside of the scope of this project. But, generally speaking, video would be hosted on a CDN. This API simply provides a list of available videos to the front-end. This is currently a small list of YouTube identifiers with associated metadata (video width and height in this case), but could easily be something like a list of pre-signed URL's that allow access to videos hosted on something like the AWS CloudFront CDN which itself is backed by AWS S3.

---

## **Front-end**

This is a simple demo web page that has 4 video elements and some message areas to let the user know what is happening.

There is not much style to the page as it is really just a demonstrator for the back-end server.

Saying that, I did try to have a little bit of fun with it. For example, if the socket.io server is unavailable for any reason, all videos will pause until the server becomes available again .The currently playing states are saved locally and restored when the server comes back up. Also, the videos will not display at all if the server is not available.

The front-end sends player events (playing, paused) etc to the back-end, and in turn listens to player control messages sent from the back-end. This way, the back-end can take control of the playing of the videos. The only command it currently sends back is a pause command for the 4th oldest playing video.

---

## **Deployment**

### **<a id="deployment-back-end"></a>Back-end**

The back-end is hosted in a [Heroku](https://www.heroku.com) 'dyno'. This packages up the node.js server code into a self contained environment.

The Heroku environment has been configured to build a new version of the back-end service when new code is pushed to the project's github repo. The repo has a `.slugignore` which list the files that are not part of the production build and Heroku makes use of this file to only include production files in the build.

Each time a commit is performed for a file in the src/backend folder the backend test suite is run.

### **<a id="deployment-front-end"></a>Front-end**

The front-end is served from Github Pages. Each time changes are pushed to the github repository a fresh production front-end build is performed using a pre-push hook. If a new build has been created, the push is aborted so that the new build files can also be committed and pushed. Github pages serves files from the `/docs` folder, hence the build process places the bundle files there rather than to a 'public' folder.

---

## **Building and running locally**

For this project to build and run locally a UNIX environment is required and nodejs 10.x with NPM 6.x needs to be available.

There are a list of useful scripts in the [package.json](./package.json) file.

To run both the front- and back-end with one command, from a terminal run `npm run start:all:dev`.

To run the front- and back-end separately so that manual testing of the server being unavailable can the carried out, please run in separate terminal windows `npm run start:backend:dev` and `npm run start:frontend:dev`.

---

## **Testing locally**

To run a test suite, please run `npm run test:backend`.

There is currently no front-end test suite as the front-end is really just a demonstrator for the back-end.
