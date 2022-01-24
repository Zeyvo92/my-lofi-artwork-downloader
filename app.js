"use strict";

import * as cheerio from "cheerio";
import axios from "axios";
import fs from "fs";
import path from "path";

const BASE_URL = "https://lofirecords.com/blogs/releases";

const getArtkwork = async () => {
  const html = (await axios.get(BASE_URL)).data;
  const $ = cheerio.load(html);
  const miniWraps = [];
  $(".Cv_release_mini_wrap a").each((index, value) => {
    const link = `https://lofirecords.com${$(value).attr("href")}`;
    miniWraps.push(link);
  });
  const linksArr = await Promise.all(
    miniWraps.map(async (wrap) => {
      console.log(`Getting wrap link: ${wrap}`);
      const html = (await axios.get(wrap)).data;
      const $ = cheerio.load(html);
      return "https:" + $(".cv_custom_album_image_img").attr("src");
    })
  );
  const uniqueArr = [...new Set(linksArr)];
  console.log(`Starting download of ${uniqueArr.length} items`);
  await downloadImg(uniqueArr);
};

const downloadImg = async (linksArr) => {
  linksArr.map(async (url) => {
    const __dirname = path.resolve();
    const myPath = path.resolve(__dirname, "img", `image${url.slice(-10)}.png`);
    const writer = fs.createWriteStream(myPath);
    console.log(`Donwloading ${url} ...`);
    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  });
};

getArtkwork();
