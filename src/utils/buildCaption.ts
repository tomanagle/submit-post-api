import { Post } from "../model/post.model";

function buildCaption(post: Post, medium: "instagram" | "twitter") {
  const strings = [`${post.name}`];

  if (post.location) {
    strings.push(` from ${post.location}`);
  }

  strings.push(
    ` had a positive vaccine experience, they are now safe and vaxxed`
  );

  if (post.instagramHandle && medium === "instagram") {
    strings.push(
      `. Thank you @${post.instagramHandle} for sharing your story.`
    );
  }

  if (post.twitterHandle && medium === "twitter") {
    strings.push(`. Thank you @${post.twitterHandle} for sharing your story.`);
  }

  if (!post.instagramHandle && !post.twitterHandle) {
    strings.push(`. Thank you for sharing your story.`);
  }

  strings.push(" #safeandvaxxed");

  return strings.join("");
}

export default buildCaption;
