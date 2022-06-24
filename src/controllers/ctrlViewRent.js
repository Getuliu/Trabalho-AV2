const ctrl = require("./ctrlCookie.js");
const seo = require("../util/seo.json");
const db = require("../database/sqlite.js");

module.exports = {
  listen: async (fastify) => {
    fastify.get("/materias", module.exports.viewRent);
  },

  viewRent: async (request, reply) => {
    console.log("exec viewRent");
    // Validate authentication cookie
    // await ctrl.validateCookie(request, reply);

    // Sucess
    // Parameters
    let params = await module.exports.parameters();
    // Reply
    return reply.view("/src/pages/materias.hbs", params);
  },

  parameters: async function () {
    return {
      img: process.env.IMAGE_UNAVAILABLE,
      classes: await db.getClasses(),
    };
  },
};
