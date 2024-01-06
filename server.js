const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const dotenv = require('dotenv');

const YAML = require('yamljs');

dotenv.config();
const app = express();
app.use(express.json());
const swaggerDocument = YAML.load('./swagger.yaml');
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const routes = require('./Routes/routes');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api', routes);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

module.exports = server;