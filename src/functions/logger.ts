const reset = "\x1b[0m";
const bright = "\x1b[1m";

const FgRed = "\x1b[31m";
const FgGreen = "\x1b[32m";
const FgYellow = "\x1b[33m";
const FgCyan = "\x1b[36m";
const FgMagenta = "\x1b[35m";

function formatTag(tag: string, color: string) {
    const timestamp = new Date().toLocaleTimeString("pt-BR");
    return `${bright}${color}[${tag.padEnd(15, " ")}]${reset} ${FgYellow}[${timestamp}]${reset}`;
}

export const log = {
    info(tag: string, message: any, ...args: any[]) {
        console.log(formatTag(tag, FgCyan), message, ...args);
    },
    success(tag: string, message: any, ...args: any[]) {
        console.log(formatTag(tag, FgGreen), message, ...args);
    },
    warn(tag: string, message: any, ...args: any[]) {
        console.warn(formatTag(tag, FgYellow), message, ...args);
    },
    error(tag: string, message: any, ...args: any[]) {
        console.error(formatTag(tag, FgRed), message, ...args);
    },
    system(tag: string, message: any, ...args: any[]) {
        console.log(formatTag(tag, FgMagenta), message, ...args);
    }
};
