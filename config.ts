import { JsonValue, parse } from "std/jsonc/mod.ts";

export class Config {
    _data;
    constructor(data: JsonValue) {
        this._data = <{ [x: string]: unknown }> <unknown> Object.assign(
            {},
            data,
        );
    }
    _return_number(key: string) {
        const v = this._data[key];
        if (v === undefined) return undefined;
        if (typeof v === "number") {
            return v;
        }
        throw new Error(`Config ${key} value ${v} is not a number`);
    }
    _return_string(key: string) {
        const v = this._data[key];
        if (v === undefined || typeof v === "string") {
            return v;
        }
        throw new Error(`Config ${key} value ${v} is not a string`);
    }
    get token() {
        return this._return_string("token") || "";
    }
    set token(v: string) {
        this._data.token = v;
    }
    get hospital_name() {
        return this._return_string("hospital_name");
    }
    set hospital_name(i) {
        this._data.hospital_name = i;
    }
    get hospital_id() {
        return this._return_number("hospital_id");
    }
    set hospital_id(i) {
        this._data.hospital_id = i;
    }
    get id() {
        const t = this._return_string("id");
        if (!t) throw Error("id not exists.");
        return t;
    }
    get latitude() {
        const t = this._return_number("latitude");
        if (!t) throw Error("latitude not exists.");
        return t.toString();
    }
    get localname() {
        const t = this._return_string("localname");
        if (!t) throw Error("localname not exists.");
        return t.toString();
    }
    get longitude() {
        const t = this._return_number("longitude");
        if (!t) throw Error("longitude not exists.");
        return t.toString();
    }
    get password() {
        const t = this._return_string("password");
        if (!t) throw Error("password not exists.");
        return t;
    }
    get portal_url() {
        const t = this._return_string("portal_url");
        if (!t) throw Error("portal_url not exists.");
        return t;
    }
    set portal_url(s) {
        this._data.portal_url = s;
    }
    get train_url() {
        const t = this._return_string("train_url");
        if (!t) throw Error("train_url not exists.");
        return t;
    }
    set train_url(s) {
        this._data.train_url = s;
    }
    save(path: string, signal?: AbortSignal) {
        return Deno.writeTextFile(path, JSON.stringify(this._data), { signal });
    }
}

export async function load_settings(path: string) {
    const s = (new TextDecoder()).decode(await Deno.readFile(path));
    return new Config(parse(s));
}
