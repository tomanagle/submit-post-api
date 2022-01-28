import cloudinary, { UploadApiResponse } from "cloudinary";
import fs from "fs";
import path from "path";
import config from "config";
import { nanoid } from "nanoid";
import dayjs from "dayjs";
import log from "../utils/logger";
import MediaModel, { Media } from "../model/media.model";

cloudinary.v2.config({
  cloud_name: config.get("cloudinary.name"),
  api_key: config.get("cloudinary.key"),
  api_secret: config.get("cloudinary.secret"),
});

export function getFrame() {
  return `frame_${randomIntFromInterval(1, 25)}`;
}

export function buildImageUrl(
  media: Media,
  w = "1500",
  h = "1500",
  backup: string
) {
  console.log({ media });
  const { frame, version, original_filename, base } = media;

  if (!version || !original_filename || !base || !frame) {
    return backup;
  }

  return `https://res.cloudinary.com/${config.get(
    "cloudinary.name"
  )}/image/upload/c_thumb,g_faces,w_${w},h_${h}/c_scale,g_south_west,l_frames:${frame},w_${w},x_0,y_0/v${version}/posts/${base}/${original_filename}.jpeg`;
}

export function getBasePath(date = new Date()) {
  return `${dayjs(date).format("DD_MM_YYYY")}`;
}

function clearFolder(dir: string) {
  fs.readdir(dir, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(path.join(dir, file), (err) => {
        if (err) {
          log.error(err, `Error deleting files from directory ${dir}`);
        }
      });
    }
  });
}

function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export async function uploadImage(file: any, basePrefix = "") {
  const mediaId = nanoid();

  const dir = `${process.cwd()}/tmp/`;

  const cleanData = file
    .replace(/^data:image\/png;base64,/, "")
    .replace(/^data:image\/jpeg;base64,/, "")
    .replace(/^data:image\/jpg;base64,/, "");

  const bitmap = Buffer.from(String(cleanData), "base64");

  const filePath = path.join(`${dir}${mediaId}.jpg`);

  try {
    await fs.writeFileSync(filePath, bitmap);
  } catch (e) {
    log.error(e, "Error writing file");
    throw e;
  }

  const base = `${basePrefix}${dayjs().format("DD_MM_YYYY")}`;

  const result = await cloudinary.v2.uploader.upload(
    filePath,
    // eslint-disable-next-line @typescript-eslint/camelcase
    { public_id: `posts/${base}/${mediaId}` },
    (err, res) => {
      if (err) {
        log.error(err, "Error uploading file");
        clearFolder(dir);
        return false;
      }

      return res;
    }
  );

  clearFolder(dir);

  const frame = `frame_${randomIntFromInterval(1, 25)}`;

  const image = `https://res.cloudinary.com/${config.get(
    "cloudinary.name"
  )}/image/upload/c_thumb,g_faces,w_1500,h_1500/c_scale,g_south_west,l_frames:${frame},w_1500,x_0,y_0/v${
    result.version
  }/posts/${base}/${result.original_filename}.jpeg`;

  return { media: result, image };
}

export async function createMedia(input: UploadApiResponse) {
  return MediaModel.create(input);
}

export async function findMediaById(imageId: string) {
  return MediaModel.findById(imageId).lean();
}
