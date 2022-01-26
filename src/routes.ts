import { FastifyInstance } from "fastify";
import { uploadMediaHandler } from "./controller/media.controller";

import {
  approvePostHandler,
  createPostHandler,
  getPostsHandler,
  getPostsPreview,
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

  f.post("/api/m", uploadMediaHandler);

  f.post("/api/posts", {
    handler: createPostHandler,
    schema: {
      body: { $ref: "createPostSchema#" },
    },
  });

  f.get("/api/posts", {
    handler: getPostsHandler,
  });

  f.get("/api/posts/preview", getPostsPreview);

  f.post("/api/posts/:postId/approve", {
    preHandler: async (req, res) => {
      const isAuth = await verifyUser(req);

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
      const isAuth = await verifyUser(req);

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
