import https from 'https';

const url = "https://api.github.com/repos/VinitSurve/Personal-DSA-Workspace/actions/runs";

https.get(url, { headers: { 'User-Agent': 'Node.js' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const runs = JSON.parse(data).workflow_runs;
    if (runs && runs.length > 0) {
      console.log("Latest Run Commit Message:", runs[0].head_commit.message);
      console.log("Latest Run Conclusion:", runs[0].conclusion);
      console.log("Second Run Commit Message:", runs[1].head_commit.message);
      console.log("Second Run Conclusion:", runs[1].conclusion);
    }
  });
}).on('error', err => console.log(err));
