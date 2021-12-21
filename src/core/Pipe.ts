import debounce from "../utils/debounce";

export interface PipeOptions<T> {
    maxLength?: number;
    initialValue?: T[];
}

class Pipe<T> {
    private readonly stack: T[];
    private readonly foldedStack: T[];
    private readonly staging: T[];
    private readonly _maxLength: number;

    constructor({ maxLength = 20, initialValue }: PipeOptions<T> = {}) {
        this._maxLength = maxLength;
        this.stack = initialValue ? initialValue : [];
        this.foldedStack = [];
        this.staging = [];
    }

    push(item: T) {
        this.stack.push(item);
        if (this.foldedStack.length > 0) {
            // refer from https://stackoverflow.com/a/1234337/4021637
            this.foldedStack.length = 0;
        }
        if (this.stack.length > this._maxLength) {
            this.stack.shift();
        }
        console.log(this.stack);
    }

    debouncePush(item: T, merger: (prev: T, curr: T) => false | T) {
        if (this.staging.length === 0) {
            this.staging.push(item);
        } else {
            let prevIndex = this.staging.length - 1;
            let prev = this.staging[prevIndex];
            let merged = merger(prev, item);
            if (merged === false) {
                this.commit();
                this.staging.push(item);
            } else {
                this.staging.splice(prevIndex, 1, merged);
            }
        }
        this.debounceCommit();
    }

    commit() {
        this.staging.forEach((item) => {
            this.push(item);
        });
        this.staging.length = 0;
    }

    debounceCommit = debounce(() => {
        this.commit();
    }, 150)

    backward() {
        this.commit();
        if (this.stack.length === 0) {
            return;
        }
        let latestItem = this.stack.pop();
        this.foldedStack.push(latestItem);
        return latestItem;
    }

    forward() {
        if (this.foldedStack.length === 0) {
            return;
        }
        let oldestItem = this.foldedStack.pop();
        this.stack.push(oldestItem);
        return oldestItem;
    }
}

export default Pipe;