

export function omit<T extends object, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K> {
    let result = {
        ...obj,
    };

    for (let key in keys) {
        if (result.hasOwnProperty(key)) {
            delete result[key];
        }
    }
    return result;
}


