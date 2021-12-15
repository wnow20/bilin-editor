interface Command {
    readonly type: string;
}
export type Action<T> = {
    [P in keyof T]: T[P];
} & Command;


type TextAction = Action<{ text: string, blockId: string }>;
type BlockInsertAction = Action<{ text: string, blockId: string }>;
