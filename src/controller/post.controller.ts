import { pick } from "lodash";
import { FastifyReply, FastifyRequest } from "fastify";
import { status } from "../model/post.model";
import { uploadImage } from "../service/media.service";
import {
  createPost,
  findOneAndUpdatePost,
  updatePostStatus,
} from "../service/post.service";
import { createAirtableRecord } from "../utils/airtable";

export async function createPostHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const { image: imageBase64, ...body } = req.body as {
    image: string;
  };

  // @ts-ignore
  const post = await createPost(body);

  if (!post) {
    return reply.code(401).send("Nope");
  }

  reply.code(200).send(pick(post.toJSON(), ["_id"]));

  const image = await uploadImage(imageBase64);

  await post.updateOne({
    image,
  });

  await post.save();
}

export async function approvePostHandler(
  request: FastifyRequest<{
    Params: {
      postId: string;
    };
  }>,
  reply: FastifyReply
) {
  const postId = request.params.postId;

  const post = await updatePostStatus(postId, status.approved);

  if (!post) {
    return reply.code(404).send("Could not find post");
  }

  return post;
}

export async function rejectPostHandler(
  request: FastifyRequest<{
    Params: {
      postId: string;
    };
  }>,
  reply: FastifyReply
) {
  const postId = request.params.postId;

  const post = await updatePostStatus(postId, status.rejected);

  if (!post) {
    return reply.code(404).send("Could not find post");
  }

  return post;
}

export async function processQue() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  const post = await findOneAndUpdatePost(
    {
      status: status.pending,
      createdAt: { $lt: fiveMinutesAgo },
    },
    {
      status: status.ready,
    },
    {
      lean: true,
      select: "-_id name image caption instagramHandle twitterHandle location",
      sort: {
        createdAt: 1,
      },
    }
  );

  if (post) {
    createAirtableRecord(post);
  }
}
