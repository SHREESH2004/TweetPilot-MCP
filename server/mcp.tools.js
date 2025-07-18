import { configDotenv } from "dotenv";
import { TwitterApi } from "twitter-api-v2";

configDotenv(); // Loads .env file

const twitterClient = new TwitterApi({
    appKey: process.env.TWITTER_APP_KEY,
    appSecret: process.env.TWITTER_APP_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

export async function createPost(status) {
    const newPost = await twitterClient.v2.tweet(status);
    return {
        content: [
            {
                type: "text",
                text: `Tweeted: ${status}`,
            },
        ],
    };
}
