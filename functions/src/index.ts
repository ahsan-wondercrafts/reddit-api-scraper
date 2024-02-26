import axios from "axios";
import { onRequest } from "firebase-functions/v2/https";

exports.fetchRedditData = onRequest(async (request, response) => {
  const topic = request.body.topic;
  if (!topic) {
    response.status(400).send("No topic parameter provided");
    return;
  }

  try {
    const bodyContent = {
      grant_type: "password",
      username: process.env.REDDIT_USERNAME,
      password: process.env.REDDIT_PASSWORD,
    };
    const accessToken = await axios.post(
      "https://www.reddit.com/api/v1/access_token",
      bodyContent,
      {
        auth: {
          username: process.env.REDDIT_API_USERNAME!,
          password: process.env.REDDIT_API_PASSWORD!,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    const token = accessToken.data.access_token;
    const result = await axios.get(
      `https://oauth.reddit.com/search/?q=${topic}&sort=new`,
      {
        headers: {
          Authorization: "Bearer " + token,
        },
      }
    );
    response.send(result.data);
  } catch (error) {
    console.error(error);
    response.status(500).send("Error fetching data from Reddit");
  }
});
