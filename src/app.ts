require("dotenv").config();
import log from "./utils/logger";
import Fastify, { FastifyInstance } from "fastify";
import config from "config";
import cors from "fastify-cors";
import connectToDb from "./utils/connectToDB";
import routes from "./routes";
import registerSchema from "./utils/schema";

const PORT = config.get<number>("port");
const HOST = config.get<string>("host");

const f: FastifyInstance = Fastify({
  bodyLimit: 12582912,
});

f.register(cors, function (instance) {
  return (req, callback) => {
    const origin = req.headers.origin || "";

    const corsOptions = {
      origin: origin.includes(config.get("corsOrigin")),
    };

    callback(null, corsOptions); // callback expects two parameters: error and options
  };
});

registerSchema(f);

routes(f);

// Run the server!
const start = async () => {
  try {
    await f.listen(PORT, HOST);
    await connectToDb();
    log.info(`Server started at http://${HOST}:${PORT}`);
  } catch (err) {
    log.info(err);
    process.exit(1);
  }
};

start();
