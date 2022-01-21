import { FastifyInstance } from "fastify";

function registerSchema(f: FastifyInstance) {
  f.addSchema({
    $id: "createPostSchema",
    type: "object",
    properties: {
      name: {
        type: "string",
      },
      instagramHandle: {
        type: "string",
      },
      twitterHandle: {
        type: "string",
      },
      image: {
        type: "string",
      },
      location: {
        type: "string",
      },
      caption: {
        type: "string",
        maximum: 280,
      },
    },
    required: ["name"],
    additionalProperties: false,
  });

  f.addSchema({
    $id: "updatePostStatusSchema",
    type: "object",
    properties: {
      postId: {
        type: "string",
      },
    },
    required: ["postId"],
    additionalProperties: false,
  });
}

export default registerSchema;
