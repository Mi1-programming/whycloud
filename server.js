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
			const files = fs.readdir(this.path, callback);
			return files;
		},
		GetFilePath(id) {
			return `${this.path}/${id}`;
		},
		GetFilePathWithExtension(id, extension) {
			const newPath = this.GetFilePath(id);
			const pathWithExtension = `${newPath}.${extension}`;
			return pathWithExtension;
		},
	};
	return cloudDirectory;
}

const fileDirectory = BuildCloudDirectory("/cloud/files");
const tagDirectory = BuildCloudDirectory("/cloud/tags");
const cloudIds = FillRelativePath("/cloud/id.json");

async function ReadJSON(name) {
	const data = await fs.promises.readFile(name, "ascii");
	const parsed = JSON.parse(data);
	return parsed;
}
function Respond(res, responseObject) {
	const responseString = JSON.stringify(responseObject);
	res.send(responseString);
}

// Navigation pages

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "/views/main/main.html"));
});
app.get("/new", (req, res) => {
	res.sendFile(path.join(__dirname, "/views/new/new.html"));
});
app.get("/tag", (req, res) => {
	res.sendFile(path.join(__dirname, "/views/tag/tag.html"));
});

// Allows the user to set multiple tags to some object id

app.post("/setTags", async (req, res) => {
	// Connect the tag and object in our JSON files

	// List the tag names (numbers) in the file

	const fileJson = fileDirectory.GetFilePathWithExtension(req.body.id, "json");
	await fs.readFile(fileJson, "ascii", (err, fileJsonData) => {
		if (err) {
			console.error(err);
			return;
		}

		const parsedData = JSON.parse(fileJsonData);

		// Remove this file from all of it's tags, so we can do a full replacement of it's tags

		parsedData.tags.forEach((tag) => {
			const tagJson = tagDirectory.GetFilePathWithExtension(tag, "json");
			fs.readFile(tagJson, "ascii", (err, tagJsonData) => {
				if (err) {
					console.error(err);
					return;
				}

				const parsedTag = JSON.parse(tagJsonData);

				const index = parsedTag.files.indexOf(req.body.id);
				parsedTag.files.splice(index, 1);

				const newStringData = JSON.stringify(parsedTag);

				fs.writeFile(tagJson, newStringData, { flag: "w" }, (err) => {
					if (err) console.error(err);
				});
			});
		});

		// Replace the tags

		parsedData.tags = req.body.tags;
		const newStringData = JSON.stringify(parsedData);

		fs.writeFile(fileJson, newStringData, { flag: "w" }, (err) => {
			if (err) console.error(err);
		});
	});

	/*
		Relink to new tag files.
		When we delete a tag this allows us to remove all references to the tag from all files 
	*/

	for await (const tag of req.body.tags) {
		const tagJson = tagDirectory.GetFilePathWithExtension(tag, "json");
		fs.readFile(tagJson, "ascii", (err, tagJsonData) => {
			if (err) {
				console.error(err);
				return;
			}

			const parsedData = JSON.parse(tagJsonData);
			parsedData.files.push(req.body.id);

			const newStringData = JSON.stringify(parsedData);

			fs.writeFile(tagJson, newStringData, { flag: "w" }, (err) => {
				if (err) console.error(err);
			});
		});
	}

	// Now it should be easy to unking the object when files or tags are deleted

	Respond(res, {
		redirectTo: "/",
	});
});
app.post("/files", async (req, res) => {
	const data = {
		files: [],
	};
	fileDirectory.ReadDirectory(async (err, files) => {
		for (const file of files) {
			const readData = await ReadJSON(fileDirectory.GetFilePath(file));
			data.files.push({
				id: readData.id,
				name: readData.name,
				uploaded: readData.uploaded,
				tags: readData.tags,
			});
		}
		Respond(res, {
			parameters: data,
		});
	});
});
app.post("/download", async (req, res) => {
	const readData = await ReadJSON(
		fileDirectory.GetFilePathWithExtension(req.body.id, "json")
	);
	Respond(res, {
		parameters: {
			name: readData.name,
			data: readData.data,
		},
	});
});
app.post("/tags", async (req, res) => {
	tagDirectory.ReadDirectory(async (err, files) => {
		const data = {
			tags: [],
		};
		for (const file of files) {
			const readData = await ReadJSON(tagDirectory.GetFilePath(file));
			data.tags.push({
				id: readData.id,
				name: readData.name,
				color: readData.color,
				files: readData.files,
			});
		}
		Respond(res, {
			parameters: data,
		});
	});
});
app.post("/deleteFile", (req, res) => {
	// TODO: Handle removing references from tags
	req.body.ids.forEach((id) => {
		fs.unlink(fileDirectory.GetFilePathWithExtension(id, "json"), () => {
			res.end();
		});
	});
});
app.post("/newFile", async (req, res) => {
	await fs.readFile(cloudIds, "ascii", (err, idData) => {
		if (err) {
			console.error(err);
			return;
		}

		const parsedIds = JSON.parse(idData);

		// Create a new file
		const newFile = JSON.stringify({
			id: parsedIds.files,
			uploaded: Date.now(),
			// These are base64 encrypted
			name: req.body.name,
			data: req.body.file,
			tags: [],
		});

		fs.writeFile(
			fileDirectory.GetFilePathWithExtension(parsedIds.files, "json"),
			newFile,
			{ flag: "wx" },
			(err) => {
				if (err) console.error(err);
			}
		);

		// Increment the id
		parsedIds.files++;
		const idString = JSON.stringify(parsedIds);
		fs.writeFile(cloudIds, idString, (err) => {
			if (err) console.error(err);
		});
	});
	console.log("Added!");
	res.end();
});

app.listen(port, () => {
	console.log(`Cloud listening on port ${port}`);
});
