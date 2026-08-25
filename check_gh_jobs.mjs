import https from 'https';

const url = "https://api.github.com/repos/VinitSurve/Personal-DSA-Workspace/actions/runs/32868054044/jobs";

https.get(url, { headers: { 'User-Agent': 'Node.js' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const jobs = JSON.parse(data).jobs;
    if (jobs && jobs.length > 0) {
      console.log("Job Name:", jobs[0].name);
      console.log("Conclusion:", jobs[0].conclusion);
      
      // Let's print steps
      jobs[0].steps.forEach(step => {
        if (step.conclusion !== 'success') {
          console.log("Failed Step:", step.name, step.conclusion);
        }
      });
    }
  });
}).on('error', err => console.log(err));
