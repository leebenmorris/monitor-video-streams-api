const server = require('./serverSetup');

const PORT = process.env.PORT || 7080;
server.listen(PORT);
