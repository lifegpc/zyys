// @ts-ignore Return type must be boolean
export function ask_prompt(message?: string): boolean {
    while (1) {
        const d = prompt(message);
        if (d !== null) {
            const s = d.toLowerCase();
            if (s == "y" || s == "yes") return true;
            else if (s == "n" || s == "no") return false;
        }
    }
}

export function sleep(time: number): Promise<undefined> {
    return new Promise((r) => {
        setTimeout(() => {
            r(undefined);
        }, time);
    });
}
