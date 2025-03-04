const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

app.use("/static", express.static(path.join(__dirname, "public")));
app.use(express.json({ limit: "1gb" }));

const port = 3000;
const fileDir = path.join(__dirname, "/cloud/files");
const cloudIds = path.join(__dirname, "/cloud/id.json");

function ToDataPath(id) {
	return `${fileDir}/${id}`;
}
function ToDataPathEx(id, ex) {
	return `${ToDataPath(id)}.${ex}`;
}
async function ReadJSON(name) {
	const data = await fs.promises.readFile(name, "ascii");
	const jData = JSON.parse(data);
	return jData;
}
async function FindItem(name) {
	const data = await ReadJSON(name);
	const result = {
		id: data.id,
		uploaded: data.uploaded,
		user: {
			name: data.name,
			desc: data.desc,
		},
	};
	return result;
}
async function FindItemFile(name) {
	const data = await ReadJSON(name);
	const result = {
		name: data.name,
		data: data.data,
	};
	return result;
}

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "/views/main/main.html"));
});
app.get("/new", (req, res) => {
	res.sendFile(path.join(__dirname, "/views/new/new.html"));
});

app.post("/getPage", async (req, res) => {
	const fileList = [];
	fs.readdir(fileDir, async (err, files) => {
		for (const file of files) {
			const data = await FindItem(ToDataPath(file));
			fileList.push(data);
		}
		const fileString = JSON.stringify(fileList);
		res.send(fileString);
	});
});
app.post("/download", async (req, res) => {
	const data = await FindItemFile(ToDataPathEx(req.body.id, "json"));
	const dataStr = JSON.stringify(data);
	res.send(dataStr);
});
app.post("/get", async (req, res) => {
	const datas = [];
	console.log(req.body.ids);
	for await (const id of req.body.ids) {
		const newData = await FindItem(ToDataPathEx(id, "json"));
		datas.push(newData);
	}
	const dataStr = JSON.stringify(datas);
	res.send(dataStr);
});
app.post("/dodel", (req, res) => {
	req.body.ids.forEach((id) => {
		fs.unlink(ToDataPathEx(id, "json"), () => {
			res.end();
		});
	});
});
app.post("/donew", async (req, res) => {
	await fs.readFile(cloudIds, "ascii", (err, idData) => {
		if (err) {
			console.error(err);
			return;
		}

		const jIdData = JSON.parse(idData);

		// Create a new file
		const newFile = JSON.stringify({
			id: jIdData.files,
			uploaded: Date.now(),
			// These are base64 encrypted
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

		// Increment the id
		jIdData.files++;
		const jIdString = JSON.stringify(jIdData);
		fs.writeFile(cloudIds, jIdString, (err) => {
			if (err) console.error(err);
		});
	});
	console.log("Added!");
	res.end();
});

app.listen(port, () => {
	console.log(`Cloud listening on port ${port}`);
});
