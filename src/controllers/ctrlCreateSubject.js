const db = require("../database/sqlite.js");

module.exports = {
  listen: async (fastify) => {
    fastify.post("/create/subject", module.exports.createSubject);
  },

  createSubject: async (request, reply) => {
    console.log("exec createSubject");

    let data = request.body;

    try {
      await db.addSubject(data);
    } catch (error) {
      console.log(error);
    }

    let params = await module.exports.parameters();

    return reply.view("/src/pages/lista.hbs", params);
  },

  parameters: async function () {
    return {
      classes: await db.getClasses(),
    };
  },
};
