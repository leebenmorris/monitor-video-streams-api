const videoList = [
    {
        videoId: 'hY7m5jjJ9mM',
        height: 158,
        width: 280,
    },
    {
        videoId: 'F7uSppqT8bM',
        height: 158,
        width: 280,
    },
    {
        videoId: 'rNSnfXl1ZjU',
        height: 158,
        width: 280,
    },
    {
        videoId: '94PLgLKcGW8',
        height: 158,
        width: 280,
    },
];

function getVideoList(cb) {
    setTimeout(cb, 200, videoList);
}

module.exports = getVideoList;
