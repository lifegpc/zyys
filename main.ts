import { parse } from "std/flags/mod.ts";
import { load_settings } from "./config.ts";
import { Client } from "./client.ts";
import { ask_prompt } from "./utils.ts";

enum CMD {
    Unknown,
    Login,
    CheckIn,
}

const args = parse(Deno.args, {
    alias: { config: ["c"] },
    string: ["config"],
    default: { config: "./config.json" },
});

const settings = await load_settings(args.config);
const rcmd = args._[0].toString().toLowerCase();
let cmd = CMD.Unknown;
if (rcmd == "l" || rcmd == "login") cmd = CMD.Login;
if (rcmd == "c" || rcmd == "checkin") cmd = CMD.CheckIn;

async function login() {
    const c = new Client(settings);
    const l = await c.queryTrainHospital();
    const id = settings.hospital_id;
    const name = settings.hospital_name;
    const d = l.find((v) => {
        if (id !== undefined) return v.trainhospitalid === id;
        if (name !== undefined) return v.name === name;
        return false;
    });
    if (!d) throw Error("Failed to find hospital.");
    settings.hospital_id = d.trainhospitalid;
    settings.hospital_name = d.name;
    settings.portal_url = d.portalurl;
    settings.train_url = d.clouddoctortrainurl;
    const status = await c.loginCheck();
    settings.token = status.token;
    await settings.save(args.config);
}

async function checkin() {
    const c = new Client(settings);
    const i = await c.getNingboScheduleInitData();
    console.log("按钮名称：", i.buttonname);
    console.log("列表内容：", i.signlist);
    const cfg = settings;
    if (!ask_prompt("打卡吗？(y/n)")) return;
    await c.checkIn(cfg.latitude, cfg.longitude, cfg.localname);
    console.log("打卡成功！");
}

async function main() {
    if (cmd == CMD.Login) {
        await login();
    } else if (cmd == CMD.CheckIn) {
        await checkin();
    }
}

main();
