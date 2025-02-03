const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

app.use("/static", express.static(path.join(__dirname, "public")));
app.use(express.json({ limit: "1gb" }));

const port = 3000;
const fileDir = path.join(__dirname, "/cloud/files");
const cloudIds = path.join(__dirname, "/cloud/id.json");

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "/views/main/main.html"));
});
app.get("/delete", (req, res) => {
	res.sendFile(path.join(__dirname, "/views/delete/delete.html"));
});
app.get("/new", (req, res) => {
	res.sendFile(path.join(__dirname, "/views/new/new.html"));
});
// TODO: Error handling, and security
app.get("/getPage", async (req, res) => {
	const fileList = [];
	fs.readdir(fileDir, async (err, files) => {
		for (const file of files) {
			const data = await fs.promises.readFile(`${fileDir}/${file}`, "ascii");
			const jData = JSON.parse(data);
			fileList.push({
				name: jData.name,
				desc: jData.desc,
			});
		}
		const fileString = JSON.stringify(fileList);
		res.send(fileString);
	});
});

app.post("/dodel", (req, res) => {
	console.log("deleted!");
	res.redirect("/");
});
app.post("/donew", async (req, res) => {
	await fs.readFile(cloudIds, "ascii", (err, idData) => {
		if (err) {
			console.error(err);
			return;
		}

		// Increment the id
		const jIdData = JSON.parse(idData);
		jIdData.files++;
		const jIdString = JSON.stringify(jIdData);
		fs.writeFile(cloudIds, jIdString, (err) => {
			if (err) console.error(err);
		});

		// Create a new file
		const newFile = JSON.stringify({
			name: req.body.name,
			data: req.body.file,
			desc: req.body.desc,
		});
		fs.writeFile(
			path.join(__dirname, `/cloud/files/${jIdData.files}.json`),
			newFile,
			{ flag: "wx" },
			(err) => {
				if (err) console.error(err);
			}
		);
	});
	console.log("Added!");
	res.redirect("/");
});

app.listen(port, () => {
	console.log(`Cloud listening on port ${port}`);
});
