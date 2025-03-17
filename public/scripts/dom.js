import fileJS from "/static/scripts/file.js";

const selected = {};

class Tag {
	constructor(id, name) {
		this.id = id;
		this.name = name;
	}
}
class File {
	constructor(id, props, tags) {
		this.id = id;
		this.props = props;
		this.tags = tags;
		this.row = undefined;
	}
	Select() {
		this.row.classList.add("select");
		selected[this.id] = this;
	}
	Deselect() {
		this.row.classList.remove("select");
		delete selected[this.id];
	}
	MakeDom(parentId) {
		const parent = document.getElementById(parentId);
		const newRow = document.createElement("tr");
		newRow.classList = "fileRow";

		// NAME, DESCRIPTION, UPLOADED

		parent.appendChild(newRow);

		const cross = document.createElement("td");
		cross.classList = "cross";
		newRow.appendChild(cross);

		this.props.forEach((elem) => {
			const newColumn = document.createElement("td");
			newColumn.innerText = elem;
			newRow.appendChild(newColumn);
		});

		// TAGS

		const tagsColumnTd = document.createElement("td");
		const tagsColumnDiv = document.createElement("div");
		tagsColumnTd.appendChild(tagsColumnDiv);
		tagsColumnDiv.classList = "hflex gap4";

		this.tags.forEach((elem) => {
			const tagButton = document.createElement("button");
			tagButton.innerText = elem;
			tagButton.classList = "tag";
			tagsColumnDiv.appendChild(tagButton);
		});
		const tagManageButton = document.createElement("button");
		tagManageButton.innerText = "+";
		tagsColumnDiv.appendChild(tagManageButton);

		newRow.appendChild(tagsColumnTd);

		// SELECTING

		this.row = newRow;
		if (selected[this.id] != undefined) {
			this.row.classList.add("select");
		}
		this.row.addEventListener("click", () => {
			if (selected[this.id] == undefined) {
				this.Select();
				return;
			}
			this.Deselect();
		});
	}
	async Download() {
		const data = {
			id: this.id,
		};
		const strData = JSON.stringify(data);

		const res = await fileJS.FetchJSON("/download", strData);

		const fileData = fileJS.Base64ToBytes(res.data);
		const name = fileJS.Decode64(res.name);

		const link = document.createElement("a");
		document.body.appendChild(link);
		link.style = "display: none";
		const blob = new Blob([fileData], { type: "octet/stream" });
		const url = window.URL.createObjectURL(blob);
		link.href = url;
		link.download = name;
		link.click();
		window.URL.revokeObjectURL(url);
		link.remove();
	}
}
export default {
	File,
	selected,
};
