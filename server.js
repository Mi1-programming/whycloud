const express = require("express");
const path = require("path");
const fs = require("fs");

const port = 3000;
const app = express();

app.use("/static", express.static(path.join(__dirname, "public")));
app.use(express.json({ limit: "1gb" }));

function FillRelativePath(relativePath) {
	return path.join(__dirname, relativePath);
}
function BuildCloudDirectory(relativePath) {
	const cloudDirectory = {
		path: FillRelativePath(relativePath),
		ReadDirectory(callback) {
			const files = fs.readdir(this.path, callback)
			return files
		},
		GetFilePath(id) {
			return `${this.path}/${id}`;
		},
		GetFilePathWithExtension(id, extension) {
			const newPath = this.GetFilePath(id)
			const pathWithExtension = `${newPath}.${extension}`;
			return pathWithExtension
		},
	}
	return cloudDirectory
}

const fileDirectory = BuildCloudDirectory("/cloud/files")
const tagDirectory = BuildCloudDirectory("/cloud/tags")
const cloudIds = FillRelativePath("/cloud/id.json");

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
async function FindTag(name) {
	const data = await ReadJSON(name);
	const result = {
		name: data.name,
		files: data.files
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
	fileDirectory.ReadDirectory(async (err, files) => {
		for (const file of files) {
			const data = await FindItem(fileDirectory.GetFilePath(file));
			fileList.push(data);
		}
		const fileString = JSON.stringify(fileList);
		res.send(fileString);
	})
});
app.post("/download", async (req, res) => {
	const data = await FindItemFile(fileDirectory.GetFilePathWithExtension(req.body.id, "json"));
	const dataStr = JSON.stringify(data);
	res.send(dataStr);
});
app.post("/get", async (req, res) => {
	const datas = [];
	for await (const id of req.body.ids) {
		const newData = await FindItem(fileDirectory.GetFilePathWithExtension(id, "json"));
		datas.push(newData);
	}
	const dataStr = JSON.stringify(datas);
	res.send(dataStr);
});
app.post("/tags", async (req, res) => {
	tagDirectory.ReadDirectory(async (err, files) => {
		const fileList = []
		for (const file of files) {
			const data = await FindTag(tagDirectory.GetFilePath(file));
			fileList.push(data);
		}
		const fileString = JSON.stringify(fileList);
		console.log(fileList)
		res.send(fileString);
	})
});
app.post("/dodel", (req, res) => {
	req.body.ids.forEach((id) => {
		fs.unlink(fileDirectory.GetFilePath(id, "json"), () => {
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
