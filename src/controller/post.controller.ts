import { pick } from "lodash";
import { FastifyReply, FastifyRequest } from "fastify";
import { status } from "../model/post.model";
import { uploadImage } from "../service/media.service";
import {
  createPost,
  findOneAndUpdatePost,
  findPosts,
  updatePostStatus,
} from "../service/post.service";
import { createAirtableRecord } from "../utils/airtable";
import log from "../utils/logger";
import buildCaption from "../utils/buildCaption";

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

  if (image) {
    await post.updateOne(image);
  }

  await post.save();
}

export async function getPostsHandler(
  req: FastifyRequest<{
    Querystring: { page: number };
  }>,
  reply: FastifyReply
) {
  const page = req.query.page || 1;

  const posts = await findPosts({ page });

  return posts;
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
  const post = await findOneAndUpdatePost(
    {
      status: status.approved,
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
    log.info(post, "Submitting post");
    createAirtableRecord({
      ...post,
      instagramCaption: buildCaption(post, "instagram"),
      twitterCaption: buildCaption(post, "twitter"),
    });
  }
}
