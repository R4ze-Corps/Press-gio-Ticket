const reset = "\x1b[0m";
const bright = "\x1b[1m";
const FgRed = "\x1b[31m";
const FgGreen = "\x1b[32m";
const FgYellow = "\x1b[33m";
const FgCyan = "\x1b[36m";
const FgMagenta = "\x1b[35m";
function formatTag(tag, color) {
    const timestamp = new Date().toLocaleTimeString("pt-BR");
    return `${bright}${color}[${tag.padEnd(15, " ")}]${reset} ${FgYellow}[${timestamp}]${reset}`;
}
export const log = {
    info(tag, message, ...args) {
        console.log(formatTag(tag, FgCyan), message, ...args);
    },
    success(tag, message, ...args) {
        console.log(formatTag(tag, FgGreen), message, ...args);
    },
    warn(tag, message, ...args) {
        console.warn(formatTag(tag, FgYellow), message, ...args);
    },
    error(tag, message, ...args) {
        console.error(formatTag(tag, FgRed), message, ...args);
    },
    system(tag, message, ...args) {
        console.log(formatTag(tag, FgMagenta), message, ...args);
    }
};
