function BytesToBase64(bytes) {
	const binStr = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join(
		""
	);
	return btoa(binStr);
}
function Base64ToBytes(value) {
	const bytes = Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
	return bytes;
}
function Decode64(value) {
	const bytes = Base64ToBytes(value);
	return new TextDecoder().decode(bytes);
}
function Encode64(value) {
	const bytes = new TextEncoder().encode(value);
	const res = BytesToBase64(bytes);
	return res;
}
function GetURLParams() {
	const urlSearchParams = new URLSearchParams(window.location.search);
	const params = Object.fromEntries(urlSearchParams.entries());
	return params;
}
async function FetchJSON(url, body, method = "POST") {
	const res = await fetch(url, {
		method: method,
		body: body,
		headers: {
			"Content-Type": "application/json",
		},
	});
	const text = await res.text();
	const parsed = JSON.parse(text);

	if (parsed.redirectTo != undefined) {
		window.location.href = parsed.redirectTo;
	}

	const parameters = parsed.parameters;
	return parameters;
}
export default {
	BytesToBase64,
	Base64ToBytes,
	Decode64,
	Encode64,
	FetchJSON,
	GetURLParams,
};
