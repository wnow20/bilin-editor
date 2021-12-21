interface Command {
    readonly type: string;
}
export type Action<T> = {
    [P in keyof T]: T[P];
} & Command;


export type InsertTextAction = Action<{ type: 'insertText', text: string, blockId: string }>;
export type ImageAction = Action<{ type: 'img', url: string, blockId: string }>;
export type BlockInsertAction = Action<{ text: string, blockId: string }>;
