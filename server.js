const express = require("express");
const path = require("path");

const app = express();
app.use("/static", express.static(path.join(__dirname, "public")));

const port = 3000;

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "/views/main/main.html"));
});
app.get("/delete", (req, res) => {
	res.sendFile(path.join(__dirname, "/views/delete/delete.html"));
});
app.get("/new", (req, res) => {
	res.sendFile(path.join(__dirname, "/views/new/new.html"));
});

app.get("/dodel", (req, res) => {
	console.log("deleted!");
	res.redirect("/");
});
app.get("/donew", (req, res) => {
	console.log("added!");
	res.redirect("/");
});

app.listen(port, () => {
	console.log(`Cloud listening on port ${port}`);
});
