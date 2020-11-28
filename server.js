const crypto = require("crypto");
const express = require("express");
const cors = require("cors");

// TODO
const config = {
  key: "xxx", // access key
  secret: "xxx", // access secret
  host: "http://xxx.oss-cn-zhangjiakou.aliyuncs.com", // bucket url
  cbUrl: "http://xxx/cb", // 回调地址，将xxx改成公网可访问地址， /cb须和下面的post路由一直
};

const app = express();
const PORT = 8080;
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("test");
});

app.get("/policy", (req, res) => {
  const end = new Date().getTime() + 300000;
  const expiration = new Date(end).toISOString();
  const policy = Buffer.from(
    JSON.stringify({
      expiration,
      conditions: [["content-length-range", 0, 3 * 1024 * 1024]],
    })
  ).toString("base64");

  res.json({
    key: `test/${Date.now()}`,
    accessid: config.key,
    host: config.host,
    signature: crypto
      .createHmac("sha1", config.secret)
      .update(policy)
      .digest("base64"),
    callback: Buffer.from(
      JSON.stringify({
        callbackUrl: config.cbUrl,
        callbackBody: JSON.stringify({
          height: "${imageInfo.height}",
        }), // https://www.alibabacloud.com/help/zh/doc-detail/50092.htm
        callbackBodyType: "application/json",
      })
    ).toString("base64"),
    policy,
  });
});

app.post("/cb", (req, res) => {
  // 这里响应的内容即为前端上传的响应内容
  res.json(req.body);
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
