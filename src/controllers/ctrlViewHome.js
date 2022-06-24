const ctrl = require("./ctrlCookie.js");
const seo = require("../util/seo.json");
const db = require("../database/sqlite.js");
const rd = require("random");

module.exports = {
  listen: async (fastify) => {
    fastify.get("/home", module.exports.viewHome);
  },

  viewHome: async (request, reply) => {
    console.log("exec viewHome");
    // Validate authentication cookie
    // await ctrl.validateCookie(request, reply);

    // Success
    // Parameters
    let params = await module.exports.parameters(request);

    const response = await db.getAdminLogged();
    if (response[0].admin == "true") {
      console.log(response[0].admin);
      return reply.view("/src/pages/home.hbs", params);
    } else {
      console.log(response[0].admin);
      return reply.view("/src/pages/lista.hbs", params);
    }
    // Reply
  },

  parameters: async function (request) {
    return {
      classes: await db.getClasses(),
    };
  },
};
