const http = require('http');
const app = require('./app');
const { connectToDB } = require('./db'); // This now uses mongoose.connect inside db.js

const port = process.env.PORT || 3000;
const server = http.createServer(app);

connectToDB()
  .then(() => {
    server.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Server failed to start:", err);
    process.exit(1); // Exit if DB connection fails
  });
