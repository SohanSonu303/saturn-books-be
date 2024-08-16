const express = require("express");
const mainRouter = require("./routes/index")
const cors = require("cors")
const jwt = require("jsonwebtoken")
const swaggerJSDoc = require('swagger-jsdoc'); 
const swaggerUi = require('swagger-ui-express');


const app = express();

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
      title: 'Test API',
      version: '1.0.0',
      description: 'A simple API documentation',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
  };
  
  // Options for the swagger docs
  const options = {
    swaggerDefinition,
    apis: ['./index.js','./routes/*.js'], // Pointing to this file itself for simplicity
  };
  
  // Initialize swagger-jsdoc
  const swaggerSpec = swaggerJSDoc(options);
  
  // Use Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.use(cors());
app.use(express.json())


app.use("/api/v1",mainRouter);

/**
 * @swagger
 * /getMyVersion:
 *   get:
 *     summary: Test API
 *     responses:
 *       200:
 *         description: A simple Hello World API
 */
app.get("/getMyVersion",(req,res) => {
    res.json({version: "1.0.0"})
})
app.listen(3000);