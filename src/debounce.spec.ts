import debounce from "./debounce";

describe('Util Debounce Tests', () => {
    it('debounce delay execute correctly', async () => {
        let count = 0;
        let debouncedCounter = debounce(() => {
            count++;
        }, 100);

        debouncedCounter();
        debouncedCounter();
        expect(count).toEqual(0);

        await waits(100);
        expect(count).toEqual(1);
    });
});

async function waits(time: number) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, time)
    })
}
