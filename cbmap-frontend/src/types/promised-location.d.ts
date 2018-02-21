declare module 'promised-location' {
    interface PromisedLocationOptions {
        enableHighAccuracy: boolean;
        timeout: number;
        maximumAge: number;
    }

    class PromisedLocation extends Promise<any> {
        constructor(options: PromisedLocationOptions);
    }

    export = PromisedLocation;
}
