import https from 'https';

https.get('https://api.github.com/repos/VinitSurve/Personal-DSA-Workspace/actions/runs', {
  headers: { 'User-Agent': 'Node.js' }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const runs = JSON.parse(data).workflow_runs;
    const latestRun = runs[0];
    console.log("Latest Run Status:", latestRun.status);
    console.log("Latest Run Conclusion:", latestRun.conclusion);
    console.log("Latest Run URL:", latestRun.html_url);
    
    // Fetch logs url
    console.log("Logs URL:", latestRun.logs_url);
  });
}).on('error', err => console.log(err));
