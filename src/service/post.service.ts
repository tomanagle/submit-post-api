import { omit } from "lodash";
import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";
import PostModel, { Post, status } from "../model/post.model";

export async function createPost(input: Post) {
  const post = await PostModel.create(input);

  return post;
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
