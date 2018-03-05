export function isMobileSafari() {
    const userAgent = window.navigator.userAgent;
    const isIos = !!userAgent.match(/iP(ad|od|hone)/i);
    const isWebKit = !!userAgent.match(/WebKit/i);
    const isChrome = !!userAgent.match(/CriOS/i);
    return isIos && isWebKit && !isChrome;
}
