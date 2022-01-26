import { pick } from "lodash";
import { FastifyReply, FastifyRequest } from "fastify";
import {
  buildImageUrl,
  createMedia,
  getBasePath,
  getFrame,
  uploadImage,
} from "../service/media.service";

export async function uploadMediaHandler(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const { image: imageBase64 } = req.body as {
    image: string;
  };

  const image = await uploadImage(imageBase64);

  const frame = getFrame();

  const base = getBasePath();

  const media = await (
    await createMedia({ ...image.media, frame, base })
  ).toJSON();

  const url = buildImageUrl(media);

  return { ...pick(media, ["_id", url]), url };
}
