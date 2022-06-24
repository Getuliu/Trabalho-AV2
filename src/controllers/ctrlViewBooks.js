const ctrl = require("./ctrlCookie.js");
const seo = require("../util/seo.json");
const db = require("../database/sqlite.js");

module.exports = {
  listen: async (fastify) => {
    fastify.get("/lista", module.exports.viewBooks);
  },

  viewBooks: async (request, reply) => {
    console.log("exec viewBooks");
    // Validate authentication cookie
    // await ctrl.validateCookie(request, reply);
    // Success
    // Parameters
    let params = await module.exports.parameters();
    // Reply
    return reply.view("/src/pages/lista.hbs", params);
  },

  parameters: async function () {
    return {
      classes: await db.getClasses(),
    };
  },
};
