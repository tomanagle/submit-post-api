import { omit } from "lodash";
import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";
import PostModel, { Post, status } from "../model/post.model";

export async function createPost(input: Post) {
  const post = await PostModel.create(input);

  return post;
}

export async function findPendingPosts() {
  return PostModel.find({
    status: status.pending,
    image: { $ne: null },
  }).select("-__v -media");
}

const POSTS_PER_PAGE = 50;

export async function findPosts({ page = 1, limit = POSTS_PER_PAGE }) {
  const skip = (page - 1) * POSTS_PER_PAGE;

  return PostModel.find({
    status: { $ne: status.rejected },
  })
    .select("-__v -media")
    .limit(POSTS_PER_PAGE)
    .sort({ createdAt: -1 })
    .skip(skip < 0 ? 0 : skip)
    .lean();
}

export async function updatePostStatus(postId: string, status: status) {
  const post = await PostModel.findByIdAndUpdate(
    postId,
    {
      status,
    },
    { new: true }
  ).lean();

  if (!post) return null;

  return omit(post, ["__v"]);
}

export async function findOneAndUpdatePost(
  q: FilterQuery<Post>,
  u: UpdateQuery<Post>,
  o: QueryOptions = {}
) {
  return PostModel.findOneAndUpdate(q, u, o);
}
