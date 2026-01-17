
export const toSnake = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    if (Array.isArray(obj)) return obj.map(toSnake);
    if (typeof obj !== 'object' || obj instanceof Date) return obj;

    const newObj: any = {};
    Object.keys(obj).forEach(key => {
        const value = obj[key];
        if (value === undefined) return;

        // تحويل camelCase إلى snake_case
        const snakeKey = key.replace(/[A-Z]/g, (letter, index) =>
            (index > 0 ? "_" : "") + letter.toLowerCase()
        );

        // استثناء لبعض الكائنات الخاصة
        if (key === 'enabledModules') {
            newObj[snakeKey] = value;
        } else {
            newObj[snakeKey] = toSnake(value);
        }
    });
    return newObj;
};

export const toCamel = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    if (Array.isArray(obj)) return obj.map(toCamel);
    if (typeof obj !== 'object' || obj instanceof Date) return obj;

    const newObj: any = {};
    // Sort keys so that snake_case keys (with underscores) are processed AFTER camelCase keys.
    // This way, if both inbodySessions and inbody_sessions exist, the snake_case one wins.
    const keys = Object.keys(obj).sort((a, b) => {
        const aHasUnderscore = a.includes('_');
        const bHasUnderscore = b.includes('_');
        if (aHasUnderscore && !bHasUnderscore) return 1;
        if (!aHasUnderscore && bHasUnderscore) return -1;
        return 0;
    });

    keys.forEach(key => {
        const camelKey = key.replace(/(_\w)/g, m => m[1].toUpperCase());
        newObj[camelKey] = toCamel(obj[key]);
    });
    return newObj;
};
