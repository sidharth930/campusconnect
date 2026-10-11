const http = require("http");

function get(path, token) {
  return new Promise((resolve) => {
    http.get(
      {
        hostname: "localhost",
        port: 5000,
        path,
        headers: { Authorization: "Bearer " + token },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
      }
    );
  });
}

(async () => {
  const req = http.request(
    {
      hostname: "localhost",
      port: 5000,
      path: "/api/auth/login",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    async (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", async () => {
        const token = JSON.parse(d).token;

        console.log("--- TESTING SEARCH API ---");
        const u1 = await get("/api/users/search?q=Sidharth", token);
        console.log("1. User search 'Sidharth':", u1.body.length, "users found");

        const u2 = await get("/api/users/search?q=Sidharth%20Malik", token);
        console.log("2. Full name user search 'Sidharth Malik':", u2.body.length, "users found");

        const p1 = await get("/api/posts/search?q=systemdesign", token);
        console.log("3. Post search 'systemdesign':", p1.body.length, "posts found");

        const p2 = await get("/api/posts/search?q=docker", token);
        console.log("4. Post search 'docker':", p2.body.length, "posts found");

        const p3 = await get("/api/posts/search?q=dsa", token);
        console.log("5. Post search 'dsa':", p3.body.length, "posts found");

        const p4 = await get("/api/posts/search?q=c%2B%2B", token);
        console.log("6. Special char search 'c++':", p4.body.length, "posts found");

        process.exit(0);
      });
    }
  );
  req.write(JSON.stringify({ email: "sidharthmalik135@gmail.com", password: "Password123!" }));
  req.end();
})();
