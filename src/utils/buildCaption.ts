import { Post } from "../model/post.model";

function buildCaption(post: Post, medium: "instagram" | "twitter" | "web") {
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

  if (post.caption && medium === "instagram") {
    strings.push(` Here is what ${post.name} has to say: ${post.caption}`);
  }

  strings.push(" #safeandvaxxed");

  return strings.join("");
}

export default buildCaption;
