/**
 * App de Aluguel de livros
 *   O usuário autenticado pode escolher entre os livros disponíveis para alguel
 *   A devolução deve ser concluída pelo usuário em "Minha Área"
 **/

// Utilities we need
const path = require("path");
require("dotenv").config();

// Require the fastify framework and instantiate it
const fastify = require("fastify")({
  logger: false, // Set this to true for detailed logging
});

// Setup our static files
fastify.register(require("fastify-static"), {
  root: path.join(__dirname, "public"),
  prefix: "/", // optional: default '/'
});

// fastify-formbody lets us parse incoming forms
fastify.register(require("fastify-formbody"));

// Handlebars for Dynamic HTML
const hbs = require("handlebars");

// point-of-view is a templating manager for fastify
fastify.register(require("point-of-view"), {
  engine: { handlebars: hbs },
});

// Fastify Cookie Configuration
fastify.register(require("fastify-cookie"), {
  secret: `${process.env.COOKIE_SECRET}`, // Secret Key
  parseOptions: {},
});

// Load and parse SEO data

// We use a module for handling database operations in /src
const data = require("./src/util/data.json");

// File System Dependency
const fs = require("fs");

// .env HANDLEBARS Dependency Injection
let directory = `${__dirname}/src/pages/handlebars/`;
fs.readdirSync(directory)
  .filter((file) => file.includes("hbs"))
  .map((file) => {
    const fileName = file.split(".");
    hbs.registerPartial(
      fileName[0],
      fs.readFileSync(directory + file).toString()
    );
    console.log(`HANDLEBAR injected:  ${directory + file}`);
  });

// .env CONTROLLERS Dependency Injection

let ctrlDirectory = `${__dirname}/src/controllers/`;
fs.readdirSync(ctrlDirectory)
  .filter((file) => file.includes("js"))
  .map((file) => {
    let controller = require(ctrlDirectory + file);
    controller.listen(fastify);
  });

/*
    Run the server and report out to the logs
*/
fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`  Server is now listening on ${address}`);
});
