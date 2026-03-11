// // server.js — Node.js backend server
// // Install deps:  npm install express cors
// // Compile C++:   g++ -O2 -o heat2d heat2d.cpp
// // Run server:    node server.js

// const express = require("express");
// const cors    = require("cors");
// const { spawn } = require("child_process");
// const path    = require("path");

// const app  = express();
// const PORT = 3001;

// app.use(cors());                     // allow React dev server (localhost:3000)
// app.use(express.json());

// // ── POST /solve ─────────────────────────────────────────────────────────
// // Body: { N, top, bottom, left, right }
// //   N = number of BOXES (UI value).  Server adds +1 before passing to C++.
// app.post("/solve", (req, res) => {
//     const { N, top, bottom, left, right } = req.body;

//     // Validate
//     const gridSize = parseInt(N);
//     if (!gridSize || gridSize < 2 || gridSize > 30) {
//         return res.status(400).json({ error: "Grid size must be 2–30" });
//     }

//     // C++ uses node count = boxes + 1
//     const nodeN = gridSize + 1;
//     const input = `${nodeN} ${top} ${bottom} ${left} ${right}\n`;

//     // Spawn the compiled binary (must be in same folder as server.js)
//     const binaryPath = path.join(__dirname, "heat2d");
//     const child = spawn(binaryPath);

//     let stdout = "";
//     let stderr = "";

//     child.stdout.on("data", (data) => { stdout += data.toString(); });
//     child.stderr.on("data", (data) => { stderr += data.toString(); });

//     child.on("close", (code) => {
//         if (code !== 0) {
//             console.error("C++ stderr:", stderr);
//             return res.status(500).json({ error: `C++ process exited with code ${code}` });
//         }
//         try {
//             const result = JSON.parse(stdout.trim());
//             res.json(result);
//         } catch (e) {
//             console.error("JSON parse error:", e.message, "| stdout:", stdout);
//             res.status(500).json({ error: "Failed to parse C++ output" });
//         }
//     });

//     child.on("error", (err) => {
//         console.error("Failed to spawn binary:", err.message);
//         res.status(500).json({
//             error: `Could not run './heat2d'. Did you compile it? (g++ -O2 -o heat2d heat2d.cpp)`
//         });
//     });

//     // Send inputs to C++ via stdin
//     child.stdin.write(input);
//     child.stdin.end();
// });

// // ── Health check ────────────────────────────────────────────────────────
// app.get("/", (req, res) => res.json({ status: "heat2d server running" }));

// app.listen(PORT, () => {
//     console.log(`\n✅  heat2d backend running at http://localhost:${PORT}`);
//     console.log(`    Make sure ./heat2d binary exists (g++ -O2 -o heat2d heat2d.cpp)\n`);
// });





// // server.js — Node.js backend server
// // Install deps:  npm install express cors
// // Compile C++:   g++ -O2 -o heat2d heat2d.cpp
// // Run server:    node server.js

// const express = require("express");
// const cors    = require("cors");
// const { spawn } = require("child_process");
// const path    = require("path");

// const app  = express();
// const PORT = 3001;

// app.use(cors());                     // allow React dev server (localhost:3000)
// app.use(express.json());

// // ── POST /solve ─────────────────────────────────────────────────────────
// // Body: { N, top, bottom, left, right }
// //   N = number of BOXES (UI value).  Server adds +1 before passing to C++.
// app.post("/solve", (req, res) => {
//     const { N, top, bottom, left, right } = req.body;

//     // Validate
//     const gridSize = parseInt(N);
//     if (!gridSize || gridSize < 2 || gridSize > 200) {
//         return res.status(400).json({ error: "Grid size must be 2–200" });
//     }

//     // C++ uses node count = boxes + 1
//     const nodeN = gridSize + 1;
//     const input = `${nodeN} ${top} ${bottom} ${left} ${right}\n`;

//     // Spawn the compiled binary (must be in same folder as server.js)
//     const binaryPath = path.join(__dirname, "heat2d");
//     const child = spawn(binaryPath);

//     let stdout = "";
//     let stderr = "";

//     child.stdout.on("data", (data) => { stdout += data.toString(); });
//     child.stderr.on("data", (data) => { stderr += data.toString(); });

//     child.on("close", (code) => {
//         if (code !== 0) {
//             console.error("C++ stderr:", stderr);
//             return res.status(500).json({ error: `C++ process exited with code ${code}` });
//         }
//         try {
//             const result = JSON.parse(stdout.trim());
//             res.json(result);
//         } catch (e) {
//             console.error("JSON parse error:", e.message, "| stdout:", stdout);
//             res.status(500).json({ error: "Failed to parse C++ output" });
//         }
//     });

//     child.on("error", (err) => {
//         console.error("Failed to spawn binary:", err.message);
//         res.status(500).json({
//             error: `Could not run './heat2d'. Did you compile it? (g++ -O2 -o heat2d heat2d.cpp)`
//         });
//     });

//     // Send inputs to C++ via stdin
//     child.stdin.write(input);
//     child.stdin.end();
// });

// // ── Health check ────────────────────────────────────────────────────────
// app.get("/", (req, res) => res.json({ status: "heat2d server running" }));

// app.listen(PORT, () => {
//     console.log(`\n✅  heat2d backend running at http://localhost:${PORT}`);
//     console.log(`    Make sure ./heat2d binary exists (g++ -O2 -o heat2d heat2d.cpp)\n`);
// });



// server.js — Node.js backend
// npm install express cors
// g++ -O2 -o heat2d heat2d.cpp
// node server.js

const express   = require("express");
const cors      = require("cors");
const { spawn } = require("child_process");
const path      = require("path");

const app  = express();
const PORT = 3001;

// ── Critical for large grids: increase JSON body limit to 50 MB ───────
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// ── POST /solve ────────────────────────────────────────────────────────
app.post("/solve", (req, res) => {
    const { N, top, bottom, left, right } = req.body;

    const gridSize = parseInt(N);
    if (!gridSize || gridSize < 2 || gridSize > 1000) {
        return res.status(400).json({ error: "Grid size must be 2–1000" });
    }

    // C++ works in node count = boxes + 1
    const nodeN = gridSize + 1;
    const input = `${nodeN} ${top} ${bottom} ${left} ${right}\n`;

    const binaryPath = path.join(__dirname, "heat2d");
    const child      = spawn(binaryPath);

    // ── Collect stdout in chunks (important for large grids ~8 MB) ────
    const chunks = [];
    child.stdout.on("data", (chunk) => chunks.push(chunk));

    let stderr = "";
    child.stderr.on("data", (d) => { stderr += d.toString(); });

    // ── Timeout: kill if C++ takes > 5 minutes ────────────────────────
    const timer = setTimeout(() => {
        child.kill();
        res.status(504).json({ error: "C++ solver timed out (> 5 min)" });
    }, 5 * 60 * 1000);

    child.on("close", (code) => {
        clearTimeout(timer);
        if (res.headersSent) return;

        if (code !== 0) {
            console.error("C++ stderr:", stderr);
            return res.status(500).json({ error: `C++ exited with code ${code}` });
        }

        const stdout = Buffer.concat(chunks).toString("utf8").trim();

        try {
            const result = JSON.parse(stdout);
            if (result.error) return res.status(400).json(result);

            // Log stats
            const mb = (Buffer.byteLength(stdout) / 1024 / 1024).toFixed(2);
            console.log(
                `Solved ${gridSize}×${gridSize} | ` +
                `${result.iterations} iters | ` +
                `converged: ${result.converged} | ` +
                `payload: ${mb} MB`
            );
            res.json(result);

        } catch (e) {
            console.error("JSON parse error:", e.message);
            console.error("stdout preview:", stdout.slice(0, 200));
            res.status(500).json({ error: "Failed to parse C++ output" });
        }
    });

    child.on("error", (err) => {
        clearTimeout(timer);
        console.error("Spawn error:", err.message);
        res.status(500).json({
            error: `Could not run './heat2d'. Compile first: g++ -O2 -o heat2d heat2d.cpp`
        });
    });

    child.stdin.write(input);
    child.stdin.end();
});

app.get("/", (req, res) => res.json({ status: "heat2d server running", maxGrid: "1000×1000" }));

app.listen(PORT, () => {
    console.log(`\n✅  heat2d backend  →  http://localhost:${PORT}`);
    console.log(`    Gauss-Seidel FDM  |  max grid: 1000×1000`);
    console.log(`    Make sure ./heat2d is compiled\n`);
});