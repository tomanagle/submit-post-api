import config from "config";
import Airtable from "airtable";
import log from "./logger";

const base = new Airtable({
  apiKey: config.get<string>("airTableApiKey"),
}).base(config.get<string>("airTableBase"));

export async function createAirtableRecord({
  name,
  image,
  iGCaption,
  twitterCaption,
}: {
  name: string;
  image: string;
  iGCaption: string;
  twitterCaption: string;
}) {
  base("IG Posts Table").create(
    [
      {
        fields: {
          Name: name,
          Image: image,
          IGCaption: iGCaption,
          TwitterCaption: twitterCaption,
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
