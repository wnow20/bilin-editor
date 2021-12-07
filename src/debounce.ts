export default function debounce(func: () => void, wait: number) {
    let timeout: any = null;
    function debounced() {
        let executor = () => {
            timeout = null;
            func();
        }

        if (timeout != null) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(executor, wait);
    }

    return debounced;
}
