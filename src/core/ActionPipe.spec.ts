import ActionPipe from "./ActionPipe";

describe('ActionPipe Tests', () => {
    it('should push/backward/forward correctly', function () {
        let foldedPipe = new ActionPipe<string>({});
        foldedPipe.push('1');
        foldedPipe.push('2');

        let item: string;
        item = foldedPipe.backward();
        expect(item).toEqual("2");

        item = foldedPipe.backward();
        expect(item).toEqual("1");

        item = foldedPipe.backward();
        expect(item).toEqual(undefined);

        item = foldedPipe.forward();
        expect(item).toEqual('1');

        item = foldedPipe.forward();
        expect(item).toEqual('2');

        item = foldedPipe.forward();
        expect(item).toEqual(undefined);

        item = foldedPipe.backward();
        expect(item).toEqual('2');
    });

    it('should drop oldest item when stack items over maxLength', function () {
        const maxLength = 20;
        const foldedPipe = new ActionPipe<number>({maxLength: maxLength});
        for (let i = 0; i < 21; i++) {
            foldedPipe.push(i);
        }

        let count = 0;
        while (foldedPipe.backward() !== undefined) {
            count++;
        }

        expect(count).toEqual(maxLength);
    });
})