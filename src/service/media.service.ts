import cloudinary from "cloudinary";
import fs from "fs";
import path from "path";
import config from "config";
import { nanoid } from "nanoid";
import log from "../utils/logger";

cloudinary.v2.config({
  cloud_name: config.get("cloudinary.name"),
  api_key: config.get("cloudinary.key"),
  api_secret: config.get("cloudinary.secret"),
});

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

export async function uploadImage(file: any) {
  const mediaId = nanoid();

  const dir = `${process.cwd()}/tmp/`;

  const bitmap = Buffer.from(String(file), "base64");

  const filePath = path.join(`${dir}${mediaId}.png`);

  try {
    await fs.writeFileSync(filePath, bitmap);
  } catch (e) {
    log.error(e, "Error writing file");
    throw e;
  }

  const date = new Date();

  const base = `${date.getDay()}_${date.getMonth()}_${date.getFullYear()}`;

  const result = await cloudinary.v2.uploader.upload(
    filePath,
    // eslint-disable-next-line @typescript-eslint/camelcase
    { public_id: `posts/${base}/${mediaId}` },
    (err, res) => {
      if (err) {
        log.error(err, "Error uploading file");
        throw err;
      }

      return res;
    }
  );

  clearFolder(dir);

  const url = `https://res.cloudinary.com/${config.get(
    "cloudinary.name"
  )}/image/upload/c_scale,w_500,h_500/c_scale,g_south_west,l_img_overlay,w_200,x_0,y_0/v${
    result.version
  }/v-posts/${result.original_filename}.jpg`;

  return url;
}
