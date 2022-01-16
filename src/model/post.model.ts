import { prop, getModelForClass } from "@typegoose/typegoose";

export enum status {
  rejected = "rejected",
  pending = "pending",
  approved = "approved",
  ready = "ready",
}

export class Post {
  @prop({ required: true })
  public name: string;

  @prop()
  public image: string;

  @prop({ unique: true })
  public instagramHandle: string;

  @prop({ unique: true })
  public twitterHandle: string;

  @prop()
  public caption: string;

  @prop()
  public location: string;

  @prop({ type: String, enum: Object.values(status), default: status.pending })
  public status: string;
}

const PostModel = getModelForClass(Post, {
  schemaOptions: {
    timestamps: true,
  },
});

export default PostModel;
