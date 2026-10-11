<<<<<<< HEAD
# Smart Municipal Complaint Management System (v2: server + database)

Citizens file complaints, officers log in to handle them. A Random Forest suggests the category and priority.

## What is inside
```
start.bat / start.sh  one-click start (installs, starts, opens the browser)
server.js          Node.js + Express + SQLite server (API, login, validation, database)
package.json       dependencies
public/            the website (index.html, style.css, script.js)
ml/                dataset.csv, test_set.csv, evaluate_models.py  (model testing for your report)
data/              created automatically; complaints.db lives here
```

## Run it
1. Install Node.js 18 or newer from nodejs.org.
2. Open a terminal in this folder and run:
```
npm install
```
3. Set the officer password, then start the server.
   - Windows (PowerShell):  `$env:ADMIN_PASSWORD="ChooseAStrongOne"; npm start`
   - Mac / Linux:           `ADMIN_PASSWORD="ChooseAStrongOne" npm start`
   The officer account is created the first time the server starts. Username: `officer` (or set `ADMIN_USER`).
   If you do not set a password, the default is `officer123`. Change it.
4. Open http://localhost:3000

To reset the officer password, stop the server, delete the `data` folder (this also deletes all complaints), and start again with a new `ADMIN_PASSWORD`.

## If the page shows no data
Do NOT double-click `public/index.html`. The page gets its data from the server, so it must be opened through the server:
1. Start the server (`npm start`, or double-click `start.bat` on Windows / run `./start.sh` on Mac and Linux).
2. Wait for "Complaint system running at http://localhost:3000".
3. Open http://localhost:3000 in your browser.
A yellow warning at the top of the page appears when it cannot reach the server.

## What the server does
- Saves every complaint in a SQLite database, numbered MC-0001, MC-0002 ... in order received.
- Checks every field again on the server (names, 10-digit mobile, PIN, ward, text), so the rules cannot be bypassed from the browser.
- Merges a repeat report of the same issue (same category, district, PIN and street; "Bus Stand Rd" and "bus stand road" count as the same) and raises its report count.
- Tracking needs the complaint ID AND the mobile number used. Citizens never see other people's complaints, and phone numbers are never sent to the public pages.
- Officer pages need login. Passwords are stored hashed (scrypt). Sessions last 8 hours, 5 wrong logins lock that device for 15 minutes.
- Optional photo (shrunk to about 800 px in the browser) and GPS location, shown to officers with a map link.
- Officers can download all complaints as `complaints.xlsx`.

## The Random Forest
- 60 decision trees, trained in the browser on 84 labelled sample complaints (`ml/dataset.csv`).
- Features: the words, plus helper flags for category keywords, danger words, long-duration words and minor-issue words.
- Test it honestly: `cd ml`, `pip install scikit-learn pandas`, `python evaluate_models.py`. It trains on `dataset.csv` and tests on `test_set.csv` (36 complaints it has never seen).

Results from the last run (accuracy on the 36 unseen complaints):

| | always most common | keyword rule | Random Forest |
|---|---|---|---|
| Category | 17% | 86% | 86% (Python), 92% (browser version) |
| Priority | 36% | 39% | 61% (Python), 58% (browser version) |

Read these carefully: both the training and test complaints were written by one person (the AI that built this), the test set is small, and the priority labels are one person's judgement. The numbers show the idea works, not that it will score this well on real citizens' messages. Add real complaints to `dataset.csv` and the `TRAIN` list in `public/script.js` to improve it. The model understands English words only.

## Putting it online
You need a host that runs Node.js and keeps files between restarts (SQLite writes to `data/`). Render, Railway or a small VPS work. Netlify and GitHub Pages cannot run this server. Use HTTPS, set `ADMIN_PASSWORD`, and back up `data/complaints.db`.

## Known limits
- One officer role; no password change screen, no password reset by email.
- Sessions are kept in memory, so officers are logged out when the server restarts.
- No SMS or email alerts to citizens.
- Only some states have district lists; other states use a typed district.
- Not security-audited. Do not use it for real complaints without a review.
=======
# municipal-complaint-system

>>>>>>> eec51ac227df7e0ff76b6836350190e19711d6b9
