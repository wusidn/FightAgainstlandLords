/**
 *  尝试赋值
 * @param target
 * @param val
 */
export function trySet(target: any, val: any) {
    if (["undefined", "null"].includes(typeof val)) {
        return;
    }
    target = val;
}
