// https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
// @ David & dtasev
function HexToRgb(hex) {
    var bigint = parseInt(hex, 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
    }
}
// https://stackoverflow.com/questions/11867545/change-text-color-based-on-brightness-of-the-covered-background-area
// @ Alex Ball & Ed The ''Pro''
function GetForeground(lightValue, darkValue, backgroundHex) {
    const backgroundColor = HexToRgb(backgroundHex)
    const brightness = Math.round(((parseInt(backgroundColor.r) * 299) +
        (parseInt(backgroundColor.g) * 587) +
        (parseInt(backgroundColor.b) * 114)) / 1000);

    const newValue = (brightness > 125) ? darkValue : lightValue;
    return newValue
}

export default {
    GetForeground
}