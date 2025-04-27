import fileJS from "/static/scripts/file.js";
import colorJS from "/static/scripts/color.js";

class DomElement {
	constructor(id) {
		this.id = id;
		this.elements = [];
	}
	MakeDom(parent) {}
}
class SelectableDomElement extends DomElement {
	constructor(id, selected) {
		super(id);
		this.selected = selected;
	}
	Select() {
		this.elements.forEach((element) => {
			element.classList.add("select");
		});
		this.selected[this.id] = this;
	}
	Deselect() {
		this.elements.forEach((element) => {
			element.classList.remove("select");
		});
		delete this.selected[this.id];
	}
	Toggle() {
		if (this.selected[this.id] == undefined) {
			this.Select();
			return;
		}
		this.Deselect();
	}
}
class Tag extends SelectableDomElement {
	constructor(id, selected, name, color, clickEvent) {
		super(id, selected);
		this.name = name;
		this.color = color;
		this.clickEvent = clickEvent;
	}
	MakeDom(parent) {
		const newButton = document.createElement("button");
		newButton.classList = "tag";
		const hexColor = `#${this.color}`;
		newButton.style.backgroundColor = hexColor;
		newButton.style.outlineColor = hexColor;

		const foregroundColor = colorJS.GetForeground(
			"#F0F0D7",
			"#3D3D3D",
			this.color
		);
		newButton.style.color = foregroundColor;
		newButton.innerText = this.name;

		newButton.addEventListener("click", (e) => {
			if (this.clickEvent != undefined) this.clickEvent();
			e.stopPropagation();
		});

		parent.appendChild(newButton);

		this.elements.push(newButton);
		return newButton;
	}
}
class File extends SelectableDomElement {
	constructor(id, selected, props, tags) {
		super(id, selected);
		this.props = props;
		this.tags = tags;
	}
	MakeDom(parent) {
		const newRow = document.createElement("tr");
		newRow.classList = "file";

		parent.appendChild(newRow);

		// Make the checkmark for the selected items

		const cross = document.createElement("td");
		cross.classList = "check";
		newRow.appendChild(cross);

		// Make the properties

		this.props.forEach((elem) => {
			const newColumn = document.createElement("td");
			newColumn.innerText = elem;
			newRow.appendChild(newColumn);
		});

		// Make the tags column

		const tagsColumnTd = document.createElement("td");
		const tagsColumnDiv = document.createElement("div");
		tagsColumnTd.appendChild(tagsColumnDiv);
		tagsColumnDiv.classList = "hflex";

		// Make the tag manage button

		const tagManageButton = document.createElement("button");
		tagManageButton.innerText = "+";
		tagsColumnDiv.appendChild(tagManageButton);
		tagManageButton.addEventListener("click", (e) => {
			location.assign(`tag?id=${this.id}`);
			e.stopPropagation();
		});

		// Make the tags

		this.tags.forEach((tag) => {
			tag.MakeDom(tagsColumnDiv);
		});

		newRow.appendChild(tagsColumnTd);
		newRow.addEventListener("click", () => {
			this.Toggle();
		});

		this.elements.push(newRow);
		return newRow;
	}
	async Download() {
		const data = {
			id: this.id,
		};
		const strData = JSON.stringify(data);

		const res = await fileJS.FetchJSON("/download", strData);

		const fileData = fileJS.Base64ToBytes(res.data);
		const name = fileJS.Decode64(res.name);

		// Click to download

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
	Tag,
	File,
};
