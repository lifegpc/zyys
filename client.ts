import { sha1 } from "sha1/mod.ts";
import { Config } from "./config.ts";

export type HospitalInfo = {
    clouddoctortrainurl: string;
    mycodeurl: string | null;
    name: string;
    portalurl: string;
    resourceurl: string | null;
    trainhospitalid: number;
    url: string;
};

export type LoginCheckResult = {
    msg: string;
    skillcenterurl: string;
    code: string;
    mobileworkurl: string;
    tencentimuser: string;
    token: string;
    userkey: string;
    tencentimusersig: string;
    companyid: string;
    doctorminicexurl: string;
    doctorweburl: string;
    independentevaluationurl: string;
    companyname: string;
    minicexdopsurl: string;
    personid: string;
    doctordopsurl: string;
    doctorskillexamurl: string;
    personname: string;
};

export type NingboScheduleInitData = {
    code: string;
    msg: string;
    signlist: unknown[];
    buttonname: string;
};

export interface JSONResult<T> {
    code: string;
    data: T | undefined | null;
    msg: string;
}

export interface JSONResult2 {
    code: string;
    msg: string;
}

export class Client {
    baseUrl;
    cfg;
    headers;
    signal;
    readonly software = "0";
    readonly myshop_forapp_key = "987654321";
    readonly logindevicetype = "android";
    readonly fromteacher = "0";
    readonly fromandorid = "1";
    readonly version = "131";
    readonly deviceid = `设备Id获取失败,null值!版本\u003d${this.version}`;
    constructor(cfg: Config, signal?: AbortSignal) {
        this.headers = new Headers({
            "Accept-Encoding": "gzip",
            "User-Agent": "okhttp/3.6.0",
        });
        this.signal = signal;
        this.baseUrl = "http://39.104.60.22:6023/";
        this.cfg = cfg;
    }
    check_error<T>(r: JSONResult<T>): T {
        if (r.code !== "1" || r.data === undefined || r.data === null) {
            throw Error(r.msg);
        }
        return r.data;
    }
    check_error2(r: JSONResult2) {
        if (r.code !== "1") {
            throw Error(r.msg);
        }
    }
    async checkIn(
        latitude: string,
        longitude: string,
        localname: string,
        note?: string,
    ) {
        const p = this.get_base_params();
        const b = "/doctor_train/rest/ningboschedule/signstudent.do";
        const u = new URL(`${b}?${p}`, `http://${this.cfg.portal_url}`);
        const body = new URLSearchParams();
        const d = {
            logindevicetype: this.logindevicetype,
            longitude,
            latitude,
            fromandorid: this.fromandorid,
            note: note ? note : "",
            fromteacher: this.fromteacher,
            localname,
        };
        body.append("data", JSON.stringify(d));
        const re = await this.post(u, { body });
        if (re.status != 200) {
            throw new Error(
                `Fetch ${b} failed, status ${re.status} ${re.statusText}`,
            );
        }
        const data = await re.json();
        this.check_error2(data);
        return data;
    }
    get(
        url: string | Request | URL,
        options: RequestInit | undefined = undefined,
    ) {
        return this.request(url, "GET", options);
    }
    get_base_params(): URLSearchParams {
        const p = new URLSearchParams();
        p.append("token", this.cfg.token);
        p.append("software", this.software);
        p.append("myshop_forapp_key", this.myshop_forapp_key);
        return p;
    }
    async getNingboScheduleInitData() {
        const p = this.get_base_params();
        const b = "/doctor_train/rest/ningboschedule/getInitData.do";
        const u = new URL(`${b}?${p}`, `http://${this.cfg.portal_url}`);
        const body = new URLSearchParams();
        const d = {
            logindevicetype: this.logindevicetype,
            fromteacher: this.fromteacher,
            fromandorid: this.fromandorid,
        };
        body.append("data", JSON.stringify(d));
        const re = await this.post(u, { body });
        if (re.status != 200) {
            throw new Error(
                `Fetch ${b} failed, status ${re.status} ${re.statusText}`,
            );
        }
        const data: NingboScheduleInitData = await re.json();
        this.check_error2(data);
        return data;
    }
    async loginCheck() {
        const p = this.get_base_params();
        const b = "/doctor_portal/rest/loginCheck.do";
        const u = new URL(`${b}?${p}`, `http://${this.cfg.portal_url}`);
        const body = new URLSearchParams();
        const d = {
            logindevicetype: this.logindevicetype,
            password: sha1(this.cfg.password, "utf8", "hex"),
            fromandorid: this.fromandorid,
            devicetype: this.logindevicetype,
            deviceid: this.deviceid,
            fromteacher: this.fromteacher,
            loginid: this.cfg.id,
            mac: this.deviceid,
        };
        body.append("data", JSON.stringify(d));
        const re = await this.post(u, { body });
        if (re.status != 200) {
            throw new Error(
                `Fetch ${b} failed, status ${re.status} ${re.statusText}`,
            );
        }
        const data: LoginCheckResult = await re.json();
        this.check_error2(data);
        return data;
    }
    post(
        url: string | Request | URL,
        options: RequestInit | undefined = undefined,
    ) {
        return this.request(url, "POST", options);
    }
    async queryTrainHospital(): Promise<HospitalInfo[]> {
        const p = this.get_base_params();
        const b = "/cloud_doctor_train/rest/trainHospital/query.do";
        const u = new URL(`${b}?${p}`, this.baseUrl);
        const body = new URLSearchParams();
        body.append(
            "data",
            JSON.stringify({
                logindevicetype: this.logindevicetype,
                fromteacher: this.fromteacher,
                fromandorid: this.fromandorid,
            }),
        );
        const re = await this.post(u, { body });
        if (re.status != 200) {
            throw new Error(
                `Fetch ${b} failed, status ${re.status} ${re.statusText}`,
            );
        }
        return this.check_error(await re.json());
    }
    request(
        url: string | Request | URL,
        method: string | undefined = undefined,
        options: RequestInit | undefined = undefined,
    ) {
        if (url instanceof Request) {
            for (const v of this.headers) {
                url.headers.set(v[0], v[1]);
            }
            return fetch(url);
        } else {
            const d = Object.assign({ method: method || "GET" }, options);
            if (d.headers) {
                const nheaders = new Headers(d.headers);
                for (const v of this.headers) {
                    nheaders.set(v[0], v[1]);
                }
                d.headers = nheaders;
            } else {
                d.headers = this.headers;
            }
            if (!d.signal && this.signal) {
                d.signal = this.signal;
            }
            return fetch(url, d);
        }
    }
}
