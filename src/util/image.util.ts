import axios from "axios";
import { UnsplashPhoto } from "../types/unsplash.types";

export const getRandomImage = async (): Promise<UnsplashPhoto> => {
  const response = await axios.get(
    `https://api.unsplash.com/photos/random?query=Nature`,
    {
      headers: {
        Authorization: "Client-ID " + process.env.UNSPLASH_ACCESS_KEY,
      },
    }
  );

  return response.data;
};

export const wait = async (millis: number) =>
  new Promise((resolve) => setTimeout(resolve, millis));
