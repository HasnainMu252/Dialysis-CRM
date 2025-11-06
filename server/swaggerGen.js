// swaggerGen.js
import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "MERN Stack API Docs",
    description: "Auto-generated Swagger documentation for the MERN backend",
    version: "1.0.0",
  },
  servers: [
    {
      url: "http://localhost:4000/api", // change to your actual API base URL
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./src/server.js", "./routes/*.js"]; // all route entry points

swaggerAutogen()(outputFile, endpointsFiles, doc);
