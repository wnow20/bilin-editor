/**
 * omit properties from plain object by keys
 *
 * inspire by https://github.com/brielov/omick/blob/master/src/omick.ts
 * @param obj target plain object
 * @param keys the keys of the first param
 * @return Omit<T,K>
 */
export default function omit<T extends object, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K> {
    return Object.fromEntries(Object.entries(obj)
        .filter(([key]) => !keys.includes(key as K))) as Omit<T, K>;
}
