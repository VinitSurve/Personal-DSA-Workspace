import https from 'https';
import fs from 'fs';
import { execSync } from 'child_process';

const url = "https://api.github.com/repos/VinitSurve/Personal-DSA-Workspace/actions/runs/32868054044/logs";

https.get(url, { headers: { 'User-Agent': 'Node.js' } }, (res) => {
  if (res.statusCode === 302 || res.statusCode === 301) {
    const redirectUrl = res.headers.location;
    console.log("Redirecting to:", redirectUrl);
    
    https.get(redirectUrl, (logRes) => {
      const file = fs.createWriteStream("logs.zip");
      logRes.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log("Logs downloaded.");
        execSync("tar -xf logs.zip -C logs_dir");
        console.log("Logs extracted.");
      });
    });
  } else {
    console.log("Failed to download:", res.statusCode);
  }
}).on('error', err => console.log(err));
