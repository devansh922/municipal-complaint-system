// Smart Municipal Complaint Management System: Node.js + Express + SQLite
const express = require("express");
const Database = require("better-sqlite3");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

const PORT = process.env.PORT || 3000;
const DAY = 864e5;
const CATS = {
  "Roads & Potholes": { dept: "Public Works", sla: 7 },
  "Water Supply": { dept: "Water Board", sla: 3 },
  "Garbage & Sanitation": { dept: "Sanitation", sla: 2 },
  "Street Lights": { dept: "Electrical", sla: 5 },
  "Stray Animals": { dept: "Animal Control", sla: 4 },
  "Other": { dept: "General Services", sla: 10 },
};
const PRIORITIES = ["Low", "Medium", "High"];
const STATUSES = ["Submitted", "Assigned", "In Progress", "Resolved"];

fs.mkdirSync(path.join(__dirname, "data"), { recursive: true });
const db = new Database(path.join(__dirname, "data", "complaints.db"));
db.pragma("journal_mode = WAL");
db.exec(`
CREATE TABLE IF NOT EXISTS complaints (
  n INTEGER PRIMARY KEY AUTOINCREMENT,
  id TEXT UNIQUE,
  name TEXT NOT NULL, phone TEXT NOT NULL,
  state TEXT NOT NULL, district TEXT NOT NULL,
  ward TEXT NOT NULL, ward_no TEXT NOT NULL DEFAULT '',
  pin TEXT NOT NULL, loc TEXT NOT NULL, loc_key TEXT NOT NULL,
  descr TEXT NOT NULL, cat TEXT NOT NULL, pri TEXT NOT NULL,
  dept TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'Submitted',
  created INTEGER NOT NULL, due INTEGER NOT NULL, votes INTEGER NOT NULL DEFAULT 1,
  lat REAL, lng REAL, photo TEXT, log TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS staff (
  username TEXT PRIMARY KEY, salt TEXT NOT NULL, hash TEXT NOT NULL
);
`);

// ---------- passwords and sessions ----------
const hashPw = (pw, salt) => crypto.scryptSync(pw, salt, 64).toString("hex");
function ensureAdmin() {
  const user = process.env.ADMIN_USER || "officer";
  if (db.prepare("SELECT 1 FROM staff").get()) return;
  const pw = process.env.ADMIN_PASSWORD || "officer123";
  const salt = crypto.randomBytes(16).toString("hex");
  db.prepare("INSERT INTO staff VALUES (?,?,?)").run(user, salt, hashPw(pw, salt));
  console.log(`Created officer account "${user}".` + (process.env.ADMIN_PASSWORD ? "" : ' Default password is "officer123". CHANGE IT: set ADMIN_PASSWORD before the first run.'));
}
ensureAdmin();
const sessions = new Map(); // token -> { user, exp }
const SESSION_MS = 8 * 3600 * 1000;
const attempts = new Map(); // ip -> { n, reset }

function cookieToken(req) {
  const m = /(?:^|;\s*)mc_session=([a-f0-9]{64})/.exec(req.headers.cookie || "");
  return m && m[1];
}
function staffOnly(req, res, next) {
  const s = sessions.get(cookieToken(req));
  if (!s || s.exp < Date.now()) return res.status(401).json({ error: "Please log in as an officer." });
  req.user = s.user;
  next();
}

// ---------- validation (same rules as the form) ----------
const RX = {
  name: /^[\p{L}][\p{L}\p{M} .'-]{1,59}$/u,
  phone: /^[6-9]\d{9}$/,
  pin: /^[1-9]\d{5}$/,
  place: /^[\p{L}\p{M} .'-]{2,60}$/u,
};
const letters = (v) => (v.match(/\p{L}/gu) || []).length;
const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
function normLoc(s) {
  return s.toLowerCase().replace(/[^\p{L}\p{N} ]/gu, " ")
    .replace(/\brd\b/g, "road").replace(/\bst\b/g, "street").replace(/\bnr\b/g, "near")
    .replace(/\b(the|near|opp|opposite|behind|beside|next|to)\b/g, "")
    .replace(/\s+/g, " ").trim();
}
function validate(b) {
  const f = {
    name: str(b.name, 60).replace(/\s+/g, " "), phone: str(b.phone, 10),
    state: str(b.state, 60), district: str(b.district, 60),
    wardmode: str(b.wardmode, 6), ward: str(b.ward, 3),
    pin: str(b.pin, 6), loc: str(b.loc, 100), desc: str(b.desc, 1000),
    cat: str(b.cat, 40), pri: str(b.pri, 10),
  };
  const err = {};
  if (!RX.name.test(f.name)) err.name = "Enter a valid name (letters only).";
  if (!RX.phone.test(f.phone)) err.phone = "Enter a valid 10-digit mobile number.";
  if (!f.state) err.state = "Select a state.";
  if (!RX.place.test(f.district)) err.district = "Enter a valid district.";
  if (!["yes", "no", "unsure"].includes(f.wardmode)) err.wardmode = "Choose a ward option.";
  if (f.wardmode === "yes" && !/^[1-9]\d{0,2}$/.test(f.ward)) err.ward = "Enter a ward number (1 to 999).";
  if (!RX.pin.test(f.pin)) err.pin = "Enter a valid 6-digit PIN code.";
  if (f.loc.length < 3 || letters(f.loc) < 1) err.loc = "Enter the street or landmark.";
  if (f.desc.length < 10 || letters(f.desc) < 5) err.desc = "Describe the problem (at least 10 characters).";
  if (!CATS[f.cat]) err.cat = "Unknown category.";
  if (!PRIORITIES.includes(f.pri)) err.pri = "Unknown priority.";
  let lat = null, lng = null;
  if (b.lat != null && b.lng != null) {
    lat = Number(b.lat); lng = Number(b.lng);
    if (!(lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180)) { lat = lng = null; }
  }
  let photo = null;
  if (b.photo) {
    if (typeof b.photo !== "string" || !/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(b.photo) || b.photo.length > 600000)
      err.photo = "Photo must be a JPEG under about 400 KB.";
    else photo = b.photo;
  }
  return { f, err, lat, lng, photo };
}

// ---------- row mapping ----------
const toObj = (r, forStaff) => {
  const o = {
    n: r.n, id: r.id, cat: r.cat, pri: r.pri, dept: r.dept, status: r.status,
    state: r.state, district: r.district, ward: r.ward, wardNo: r.ward_no, pin: r.pin, loc: r.loc,
    desc: r.descr, created: r.created, due: r.due, votes: r.votes, log: JSON.parse(r.log),
  };
  if (forStaff) Object.assign(o, { name: r.name, phone: r.phone, lat: r.lat, lng: r.lng, hasPhoto: !!r.photo });
  return o;
};

// ---------- app ----------
const app = express();
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.set({ "X-Content-Type-Options": "nosniff", "Referrer-Policy": "same-origin", "X-Frame-Options": "DENY" });
  next();
});
app.use(express.json({ limit: "1mb" }));

// Public: create a complaint (merges with an identical open one)
app.post("/api/complaints", (req, res) => {
  const { f, err, lat, lng, photo } = validate(req.body || {});
  if (Object.keys(err).length) return res.status(400).json({ error: "Please correct the highlighted fields.", fields: err });
  const wardLabel = f.wardmode === "yes" ? "Ward " + f.ward : f.wardmode === "no" ? "No ward in this area" : "Ward not known";
  const key = normLoc(f.loc);
  const now = Date.now();
  const out = db.transaction(() => {
    const dup = db.prepare(
      "SELECT * FROM complaints WHERE cat=? AND district=? AND pin=? AND loc_key=? AND status<>'Resolved' ORDER BY n LIMIT 1"
    ).get(f.cat, f.district, f.pin, key);
    if (dup) {
      const log = JSON.parse(dup.log);
      log.push({ s: dup.status, t: now, n: "Another citizen reported the same issue" });
      db.prepare("UPDATE complaints SET votes=votes+1, log=? WHERE n=?").run(JSON.stringify(log), dup.n);
      return { id: dup.id, dept: dup.dept, due: dup.due, merged: true };
    }
    const c = CATS[f.cat];
    const due = now + c.sla * DAY;
    const log = [{ s: "Submitted", t: now, n: "Complaint received" }];
    const info = db.prepare(
      `INSERT INTO complaints (id,name,phone,state,district,ward,ward_no,pin,loc,loc_key,descr,cat,pri,dept,status,created,due,votes,lat,lng,photo,log)
       VALUES ('',?,?,?,?,?,?,?,?,?,?,?,?,?,'Submitted',?,?,1,?,?,?,?)`
    ).run(f.name, f.phone, f.state, f.district, wardLabel, f.wardmode === "yes" ? f.ward : "", f.pin, f.loc, key,
      f.desc, f.cat, f.pri, c.dept, now, due, lat, lng, photo, JSON.stringify(log));
    const id = "MC-" + String(info.lastInsertRowid).padStart(4, "0");
    db.prepare("UPDATE complaints SET id=? WHERE n=?").run(id, info.lastInsertRowid);
    return { id, dept: c.dept, due, merged: false };
  })();
  res.status(out.merged ? 200 : 201).json(out);
});

// Public: track needs BOTH the complaint ID and the mobile number used
app.get("/api/track", (req, res) => {
  const m = /(\d+)/.exec(String(req.query.id || ""));
  const phone = String(req.query.phone || "").replace(/\D/g, "");
  const notFound = () => res.status(404).json({ error: "No complaint matches that ID and mobile number." });
  if (!m || !RX.phone.test(phone)) return notFound();
  const id = "MC-" + String(parseInt(m[1], 10)).padStart(4, "0");
  const r = db.prepare("SELECT * FROM complaints WHERE id=? AND phone=?").get(id, phone);
  if (!r) return notFound();
  res.json(toObj(r, false));
});

// Public: counts and latest tickets for the home page (no personal data)
app.get("/api/stats", (req, res) => {
  const rows = db.prepare("SELECT status, due FROM complaints").all();
  const now = Date.now();
  const latest = db.prepare("SELECT n,id,cat,status,created,state,district,pin,loc,ward,ward_no FROM complaints ORDER BY n DESC LIMIT 3").all()
    .map((r) => ({ id: r.id, cat: r.cat, status: r.status, created: r.created, state: r.state, district: r.district }));
  res.json({
    total: rows.length,
    resolved: rows.filter((r) => r.status === "Resolved").length,
    inProgress: rows.filter((r) => r.status === "Assigned" || r.status === "In Progress").length,
    overdue: rows.filter((r) => r.status !== "Resolved" && r.due < now).length,
    latest,
  });
});

// Officer login
app.post("/api/login", (req, res) => {
  const ip = req.ip;
  const a = attempts.get(ip);
  if (a && a.reset > Date.now() && a.n >= 5) return res.status(429).json({ error: "Too many attempts. Try again in 15 minutes." });
  const user = str((req.body || {}).username, 60), pw = str((req.body || {}).password, 200);
  const row = db.prepare("SELECT * FROM staff WHERE username=?").get(user);
  const ok = row && crypto.timingSafeEqual(Buffer.from(hashPw(pw, row.salt), "hex"), Buffer.from(row.hash, "hex"));
  if (!ok) {
    const cur = a && a.reset > Date.now() ? a : { n: 0, reset: Date.now() + 15 * 60 * 1000 };
    cur.n++; attempts.set(ip, cur);
    return res.status(401).json({ error: "Wrong username or password." });
  }
  attempts.delete(ip);
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, { user, exp: Date.now() + SESSION_MS });
  res.set("Set-Cookie", `mc_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_MS / 1000}`);
  res.json({ user });
});
app.post("/api/logout", (req, res) => {
  sessions.delete(cookieToken(req));
  res.set("Set-Cookie", "mc_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0");
  res.json({ ok: true });
});
app.get("/api/me", (req, res) => {
  const s = sessions.get(cookieToken(req));
  if (!s || s.exp < Date.now()) return res.status(401).json({ error: "Not logged in." });
  res.json({ user: s.user });
});

// Officers only
app.get("/api/complaints", staffOnly, (req, res) => {
  res.json(db.prepare("SELECT * FROM complaints ORDER BY n").all().map((r) => toObj(r, true)));
});
app.get("/api/complaints/:id/photo", staffOnly, (req, res) => {
  const r = db.prepare("SELECT photo FROM complaints WHERE id=?").get(req.params.id);
  if (!r || !r.photo) return res.status(404).end();
  res.set("Content-Type", "image/jpeg").send(Buffer.from(r.photo.split(",")[1], "base64"));
});
app.patch("/api/complaints/:id", staffOnly, (req, res) => {
  const status = str((req.body || {}).status, 20), note = str((req.body || {}).note, 300);
  if (!STATUSES.includes(status)) return res.status(400).json({ error: "Unknown status." });
  const r = db.prepare("SELECT * FROM complaints WHERE id=?").get(req.params.id);
  if (!r) return res.status(404).json({ error: "Complaint not found." });
  const log = JSON.parse(r.log);
  log.push({ s: status, t: Date.now(), n: (note || "Status changed to " + status) + " (" + req.user + ")" });
  db.prepare("UPDATE complaints SET status=?, log=? WHERE n=?").run(status, JSON.stringify(log), r.n);
  res.json({ ok: true });
});

app.use(express.static(path.join(__dirname, "public")));
app.use("/api", (req, res) => res.status(404).json({ error: "Not found." }));
app.use((err, req, res, next) => res.status(400).json({ error: "Bad request." }));

app.listen(PORT, () => console.log(`Complaint system running at http://localhost:${PORT}`));
