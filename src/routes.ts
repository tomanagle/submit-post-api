import { FastifyInstance } from "fastify";

import {
  approvePostHandler,
  createPostHandler,
  getPostsHandler,
  processQue,
  rejectPostHandler,
} from "./controller/post.controller";
import { verifyUser } from "./utils/jwt";

function routes(f: FastifyInstance) {
  // Declare a route
  f.get("/healthcheck", {
    handler: async function () {
      processQue();
      return { status: "ok" };
    },
  });

  f.post("/api/posts", {
    handler: createPostHandler,
    schema: {
      body: { $ref: "createPostSchema#" },
    },
  });

  f.get("/api/posts", {
    handler: getPostsHandler,
  });

  f.post("/api/posts/:postId/approve", {
    preHandler: async (req, res) => {
      const isAuth = await verifyUser(req, res);

      if (!isAuth) {
        return res.code(403).send("Unauthorized");
      }
    },
    schema: {
      params: { $ref: "updatePostStatusSchema#" },
    },
    handler: approvePostHandler,
  });

  f.post("/api/posts/:postId/reject", {
    preHandler: async (req, res) => {
      const isAuth = await verifyUser(req, res);

      if (!isAuth) {
        return res.code(403).send("Unauthorized");
      }
    },
    schema: {
      params: { $ref: "updatePostStatusSchema#" },
    },
    handler: rejectPostHandler,
  });
}

export default routes;
