import { prop, getModelForClass } from "@typegoose/typegoose";

export class Media {
  @prop({ required: true })
  public asset_id: string;

  @prop({ required: true })
  public public_id: string;

  @prop({ required: true })
  public version: string;

  @prop({ required: true })
  public version_id: string;

  @prop({ required: true })
  public signature: string;

  @prop({ required: true })
  public format: string;

  @prop({ required: true })
  public secure_url: string;

  @prop({ required: true })
  public original_filename: string;

  @prop({ required: true })
  public api_key: string;

  @prop({ required: true })
  public frame: string;

  @prop({ required: true })
  public base: string;
}

const MediaModel = getModelForClass(Media, {
  schemaOptions: {
    timestamps: true,
  },
});

export default MediaModel;
