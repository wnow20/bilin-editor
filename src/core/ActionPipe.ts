interface FoldedPipeOptions<T> {
    maxLength?: number;
    initialValue?: T[];
}

class ActionPipe<T> {
    private readonly stack: T[];
    private readonly foldedStack: T[];
    private readonly _maxLength: number;

    constructor({ maxLength = 20, initialValue }: FoldedPipeOptions<T> = {}) {
        this._maxLength = maxLength;
        this.stack = initialValue ? initialValue : [];
        this.foldedStack = [];
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

    backward() {
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

export default ActionPipe;