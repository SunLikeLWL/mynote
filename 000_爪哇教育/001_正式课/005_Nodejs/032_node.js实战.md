# react.js 正课第32节：前端-node.js 实战 cli & 爬虫


## 爬虫



```js


const axios = require("axios");
const cheerio = require("cheerio")
const fs = require("fs");
const path = require("path");

const url = 'https://www.bigbigwork.com/tupian/shu49_1.html';



axios.get(url)
    .then(resp => {
        const data = resp.data;
        const $ = cheerio.load(data);
        const $imgs = $("img");

        $imgs.map((index, img) => {

            const src = $(img).attr("src");

            const url = src.split("?")[0];
            const id = url.split("/").pop();

            axios.get(src, {
                headers: {
                    referer: "https://www.bigbigwork.com/tupian/shu49_1.html"
                },
                responseType: "arraybuffer",
            })
                .then(resp => {
                    const buffer = Buffer.from(resp.data, 'buffer');
                    fs.writeFileSync(path.resolve(__dirname, `./bigbigwork/${id}`), buffer)
                })
        })
    })


```




