export function isMobileSafari() {
    const userAgent = window.navigator.userAgent;
    return userAgent.match(/Mobile/i) && userAgent.match(/Safari/i);
}
