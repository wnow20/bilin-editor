import Pipe from "./Pipe";
import {Action} from "./Action";
import {nanoid} from "nanoid";

describe('Pipe Tests', () => {
    it('should push/backward/forward correctly', function () {
        let foldedPipe = new Pipe<string>({});
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
        const foldedPipe = new Pipe<number>({maxLength: maxLength});
        for (let i = 0; i < 21; i++) {
            foldedPipe.push(i);
        }

        let count = 0;
        while (foldedPipe.backward() !== undefined) {
            count++;
        }

        expect(count).toEqual(maxLength);
    });

    it('should merge anything can merge', function () {
        let debouncePipe = new Pipe<Action<any>>({});
        let blockId = nanoid(8);
        let type = 'insertText';

        const merger = (prev: Action<any>, curr: Action<any>) => {
            if (prev.type !== curr.type || prev.blockId !== curr.blockId) {
                return false;
            }

            if (prev.type === type) {
                return {
                    ...prev,
                    text: prev.text + curr.text,
                };
            }
        };
        debouncePipe.debouncePush({ type, text: '1', blockId }, merger)
        debouncePipe.debouncePush({ type, text: '2', blockId }, merger)
        debouncePipe.debouncePush({ type, text: '3', blockId }, merger)

        debouncePipe.commit();
        let backward = debouncePipe.backward();

        expect(backward.type).toEqual(type);
        expect(backward.text).toEqual("123");
        expect(backward.blockId).toEqual(blockId);
    })

    it('should commit item which can not merge', function () {
        let debouncePipe = new Pipe<Action<any>>({});
        let blockId = nanoid(8);
        let type = 'insertText';

        const merger = (prev: Action<any>, curr: Action<any>) => {
            if (prev.type !== curr.type || prev.blockId !== curr.blockId) {
                return false;
            }

            if (prev.type === type) {
                return {
                    ...prev,
                    ...curr,
                    text: prev.text + curr.text,
                };
            }
        };
        debouncePipe.debouncePush({ type, text: '1', blockId }, merger)
        let imgUrl = 'https://www.bing.com/th?id=OHR.SiberianSunset_ZH-CN5711093662_UHD.jpg&rf=LaDigue_UHD.jpg&w=3840&h=2160&c=8&rs=1&o=3&r=0';
        debouncePipe.debouncePush({type: 'img', url: imgUrl, blockId}, merger)
        debouncePipe.debouncePush({ type, text: '3', blockId }, merger)

        let backward = debouncePipe.backward();
        expect(backward.type).toEqual(type);
        expect(backward.text).toEqual('3');

        backward = debouncePipe.backward();
        expect(backward.type).toEqual('img');
        expect(backward.url).toEqual(imgUrl);
        expect(backward.text).toBeUndefined();

        backward = debouncePipe.backward();
        expect(backward.type).toEqual(type);
        expect(backward.text).toEqual("1");
    });
})