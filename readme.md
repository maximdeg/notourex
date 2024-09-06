# Natourex

## _Project made to practice NodeJs/Express/MongoDB_

Natourex is a fictional company where you can pick a tour based on the price, location, difficulty and description.

The ✨Magic ✨ of this application relies on the technologies that was used and fun to incorporate into this software:

-  Making a NodeJs RESTful API using MVC architecture
-  Data models, schemas, data validation, and middleware
-  CRUD operations with MongoDB database locally and on the Atlas(cloud) platform
-  MongoDB geospatial queries, aggregation pipeline, and operations
-  Advanced Mongoose features: modeling geospatial data, populates, virtual populates, and indexes.
-  Relationships between data, embedding and referencing.
-  Complete modern authentication with JWT: user sign up, log in, password reset, secure cookies, etc.
-  HTML, CSS, and JavaScript website modeling
-  PUG rendering
-  Uploading files and image processing
-  Sending emails with Mailtrap and Sendgrid
-  Advanced error handling workflows

## Features

-  Being able to sign up and look at the tours as users or administrators
-  Authorization roles to create and delete tours
-  Email tokens for easy usage and verifications

## Tech and Libraries

Natourex uses a number of open source projects to work properly:

-  [node.js] - evented I/O for the backend
-  [Express] - fast node.js network app framework [@tjholowaychuk]
-  [MongoDB] - great NoSQL database software
-  [Pug] - help rendering HTML files
-  [Helmet] - Helmet helps secure Express apps by setting HTTP response headers.
-  [JWT] - Jason Web Token encription for authentications
-  [multer] - file uploader handler
-  [sharp] - image upload optimizator
-  [nodemailer] - free email sending configuration
-  [leaflet] - online API map rendering

## Installation

Natourex requires [Node.js](https://nodejs.org/) v10+ to run.

Install the dependencies and devDependencies and start the server.

```sh
mkdir natourex
cd natourex
npm i
node run start
```

For production environments...

```sh
npm install --production
NODE_ENV=production node app
```

## License

MIT

**Free Software, Hell Yeah!**

[git-repo-url]: https://github.com/joemccann/dillinger.git
[node.js]: http://nodejs.org
[@tjholowaychuk]: http://twitter.com/tjholowaychuk
[express]: http://expressjs.com
[@maximdeg]: https://github.com/maximdeg
[MongoDB]: https://www.mongodb.com
[Pug]: https://pugjs.org/api/getting-started.html
[Helmet]: https://helmetjs.github.io/
[JWT]: https://datatracker.ietf.org/doc/html/rfc7519
[multer]: https://www.npmjs.com/package/multer
[sharp]: https://www.npmjs.com/package/sharp
[nodemailer]: https://www.npmjs.com/package/nodemailer
[leaflet]: https://leafletjs.com/
