import config from "config";
import Airtable from "airtable";
import log from "./logger";

const base = new Airtable({
  apiKey: config.get<string>("airTableApiKey"),
}).base(config.get<string>("airTableBase"));

export async function createAirtableRecord({
  name,
  image,
  instagramCaption,
  twitterCaption,
  location,
  twitterHandle,
  instagramHandle,
}: {
  name: string;
  image: string;
  instagramCaption: string;
  twitterCaption: string;
  location: string;
  twitterHandle: string;
  instagramHandle: string;
}) {
  base("IG Posts Table").create(
    [
      {
        fields: {
          name,
          twitterCaption,
          instagramCaption,
          ...(image && { image }),
          ...(location && { location }),
          ...(twitterHandle && { twitterHandle }),
          ...(instagramHandle && { instagramHandle }),
        },
      },
    ],
    function (err: any, result: any) {
      if (err) {
        log.error(err, "Error posting to Airtable");
        return;
      }

      for (let i = 0; i < result.length; i++) {
        log.info(`Created post ${result[i].getId()}`);
      }
    }
  );
}
