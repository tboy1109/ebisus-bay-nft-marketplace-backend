export function wait(timeInMs: number): { promise: Promise<void>; cancel: () => void } {
    let timeoutHandle: NodeJS.Timeout;

    return {
        promise: new Promise<void>( (resolve) => {
            timeoutHandle = setTimeout(resolve, timeInMs);
        }),
        cancel: () => clearTimeout(timeoutHandle),
    };
}