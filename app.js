const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./schema/schema');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3005;
const mongo_uri = process.env.MONGO_URI;

mongoose.connect(mongo_uri, { useNewUrlParser: true });

app.use(cors());

app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);

app.listen(PORT, (err) => {
  err ? console.log(err) : console.log('Server started!');
});
