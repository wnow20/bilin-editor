type OffsetNumber = 0 | -1 | number | null;

class CaretWalker {
    private offset: OffsetNumber;
    constructor() {
        this.offset = 0;
    }

    changeOffset(nextOffset: OffsetNumber) {
        this.offset = nextOffset;
    }

    getOffset() {
        return this.offset;
    }
}


export default CaretWalker;
