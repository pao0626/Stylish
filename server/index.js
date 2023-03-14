const express = require("express");
const app = express();
const cors = require("cors");
const port = 4000;
const stylishRouter = require("./routes/stylish");

//將request進來的 data 轉成 json()
app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
);

// CORS allow all
app.use(cors());

//Main page
app.get("/", (req, res) => {
    res.json({ message: "ok" });
});

//api
app.use("/api/version_1", stylishRouter);

app.use("/admin", express.static("public"));

app.use("/api/version_1/uploads", express.static("uploads"));

/* Error handler middleware */
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    console.error(err.message, err.stack);
    res.status(statusCode).json({ message: err.message });
    return;
});

// 監聽於 4000 端口
app.listen(port, () => {
    console.log(`Example app listening at http://54.178.37.192:${port}`);
});
