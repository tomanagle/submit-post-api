import { pick } from "lodash";
import { FastifyReply, FastifyRequest } from "fastify";
import { status } from "../model/post.model";
import {
  buildImageUrl,
  findMediaById,
  uploadImage,
} from "../service/media.service";
import {
  createPost,
  findOneAndUpdatePost,
  findPendingPosts,
  findPosts,
  updatePostStatus,
} from "../service/post.service";
import { createAirtableRecord } from "../utils/airtable";
import log from "../utils/logger";
import buildCaption from "../utils/buildCaption";
import { verifyUser } from "../utils/jwt";

export async function createPostHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const { image: imageId, ...body } = req.body as {
    image: string;
  };

  const media = imageId ? await findMediaById(imageId) : null;

  const image = media ? buildImageUrl(media) : null;

  // @ts-ignore
  const post = await createPost({
    ...body,
    ...(image && { image }),
    ...(media && { media }),
  });

  if (!post) {
    return reply.code(401).send("Nope");
  }

  reply.code(200).send(pick(post.toJSON(), ["_id"]));
}

export async function getPostsHandler(
  req: FastifyRequest<{
    Querystring: { page: number };
  }>,
  reply: FastifyReply
) {
  const token = req.headers.authorization;

  if (token) {
    const verified = await verifyUser(req);

    if (verified) {
      const posts = await findPendingPosts();
      return posts;
    }

    return reply.code(403).send("Invalid token");
  }

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

    console.log("post.caption", post.caption);

    const instagramCaption = post.caption
      ? `${buildCaption(post, "instagram")} Here is what ${
          post.name
        } had to say: ${post.caption}`
      : buildCaption(post, "instagram");

    const twitterCaption = post.caption
      ? `${buildCaption(post, "twitter")} Here is what ${
          post.name
        } had to say: ${post.caption}`
      : buildCaption(post, "twitter");

    createAirtableRecord({
      ...post,
      instagramCaption,
      twitterCaption,
    });
  }
}
