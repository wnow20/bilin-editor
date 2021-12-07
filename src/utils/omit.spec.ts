import omit from "./omit";

describe("omit tests", () => {
    it("omit keys correctly", () => {
        const plainObject = {
            a: '1',
            b: '2',
            c: '3'
        };

        let result = omit(plainObject, 'a', 'b');

        expect(result).toEqual({
            c: '3'
        });
    })
})
