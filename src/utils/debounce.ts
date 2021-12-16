// refer from https://stackoverflow.com/a/60469374
type DebounceFunc<TParams extends any[], TResult> = (...args: TParams) => TResult;

export default function debounce<T extends any[]>(func: DebounceFunc<T, void>, wait: number) {
    let timeout: any = null;
    function debounced(...args: T): void {
        let executor = () => {
            timeout = null;
            func(...args);
        }

        if (timeout != null) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(executor, wait);
    }

    return debounced;
}
