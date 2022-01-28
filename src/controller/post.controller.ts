import { pick } from "lodash";
import { FastifyReply, FastifyRequest } from "fastify";
import { Post, status } from "../model/post.model";
import {
  buildImageUrl,
  findMediaById,
  getBasePath,
  getFrame,
} from "../service/media.service";
import {
  createPost,
  findOneAndUpdatePost,
  findPendingPosts,
  findPosts,
  POSTS_PER_PAGE,
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
    Querystring: { page: string; limit: string };
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

  const page = parseInt(req.query.page || "1", 10) || 1;

  const limit =
    parseInt(req.query.limit || String(POSTS_PER_PAGE), 10) || POSTS_PER_PAGE;

  const posts = await findPosts({
    page,
    limit,
    select: "-__v -media.api_key -media.__v",
    query: {
      status: { $ne: status.rejected },
    },
  });
  try {
    return posts.map((post: Post) => {
      const image = buildImageUrl(
        {
          ...post.media,

          frame: post?.media?.frame || getFrame(),
          // @ts-ignore
          base: getBasePath(new Date(post.createdAt)),
        },
        "500",
        "500",
        post.image
      );

      return {
        ...pick(post, [
          "_id",
          "name",
          "instagramHandle",
          "twitterHandle",
          "location",
          "createdAt",
        ]),
        caption: post.caption || buildCaption(post, "web"),
        image,
      };
    });
  } catch (e) {
    log.error(e);
    return [];
  }
}

export async function getPostsPreview() {
  const posts = await findPosts({
    limit: 4,
    query: {
      status: { $ne: status.rejected },
      image: { $ne: null },
    },
    select: "-__v -media.api_key -media.__v",
  });

  return posts.map((post: Post) => {
    return {
      ...pick(post, [
        "_id",
        "name",
        "instagramHandle",
        "twitterHandle",
        "location",
        "createdAt",
      ]),
      caption: post.caption || buildCaption(post, "web"),
      image: buildImageUrl(
        {
          ...post.media,

          frame: post.media.frame || getFrame(),
          // @ts-ignore
          base: getBasePath(new Date(post.createdAt)),
        },
        "500",
        "500",
        post.image
      ),
    };
  });
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

    const instagramCaption = buildCaption(post, "instagram");

    const twitterCaption = buildCaption(post, "twitter");

    createAirtableRecord({
      ...post,
      instagramCaption,
      twitterCaption,
    });
  }
}
