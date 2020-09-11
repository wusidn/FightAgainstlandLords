import os from "os";

export function getLocalAddress(family?: "IPv4" | "IPv6"): string {
    const interfaces = os.networkInterfaces();

    for (const devName in interfaces) {
        const infos = interfaces[devName] || [];
        for (const info of infos) {
            if (info.family == (family || "IPv4") && !info.internal && info.address != "127.0.0.1") {
                return info.address;
            }
        }
    }

    return "127.0.0.1";
}
