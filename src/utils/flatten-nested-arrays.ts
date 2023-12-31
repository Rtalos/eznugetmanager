// NOTE: Does not handle (or check for) circular structures.
export default function flattenNestedArray(array: Array<any>) : Array<any> {
    return array.reduce((flattened : any, item : any) => flattened.concat(Array.isArray(item) ? flattenNestedArray(item) : item), []);
}