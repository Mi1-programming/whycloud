import fileJS from "/static/scripts/file.js";
import colorJS from "/static/scripts/color.js"

const selected = {};

class DomElement {
	MakeDom(parentId) {
		alert("Not implemented")
	}
}
class Tag extends DomElement {
	constructor(name, color) {
		super();
		this.name = name;
		this.color = color;
	}
	MakeDom(parentId) {
		const parent = document.getElementById(parentId);
		const newButton = document.createElement("button");
		newButton.classList = "tag";
		const hexColor = `#${this.color}`
		newButton.style.backgroundColor = hexColor;
		newButton.style.outlineColor = hexColor;
		
		const foregroundColor = colorJS.GetForeground("#F0F0D7", "#3D3D3D", this.color)
		newButton.style.color = foregroundColor
		newButton.innerText = this.name;

		parent.appendChild(newButton)
	}
}
class File extends DomElement {
	constructor(id, props, tags) {
		super();
		this.id = id;
		this.props = props;
		this.tags = tags;
		this.row = undefined;
	}
	MakeDom(parentId) {
		const parent = document.getElementById(parentId);
		const newRow = document.createElement("tr");
		newRow.classList = "fileRow";

		parent.appendChild(newRow);

		// NAME, UPLOADED

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
	Select() {
		this.row.classList.add("select");
		selected[this.id] = this;
	}
	Deselect() {
		this.row.classList.remove("select");
		delete selected[this.id];
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
	Tag,
	selected,
};
