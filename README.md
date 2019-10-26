# **monitor-video-streams-api**

This service checks how many video streams a given user is watching and caps the number of concurrently viewable video streams to 3.

Front-end URL: https://leebenmorris.github.io/monitor-video-streams-api/

Back-end URL: https://monitor-video-streams-api.herokuapp.com

# **Description**

The main focus of this project is the back-end server, but some effort has gone into building a simple front-end web page to demonstrate how the back-end works.

The front-end is a static site and is hosted on github pages. The back-end is hosted on Heroku. These services were chosen as they are free and easy to use, the main point being to demonstrate the real-time communication between the front- and back-end across the internet.

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

## Front-end

This is a simple demo web page that has 4 video elements and some message areas to show the user what is happening.

There is not much style to the page as it is really just a demonstrator for the back-end server.

If the server is unavailable for any reason, all videos will pause until the server becomes available again. The currently playing states
