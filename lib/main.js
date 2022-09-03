const core = require('@actions/core');

try {
  // `who-to-greet` input defined in action metadata file
  console.log(`Hello ~~`);
  const time = (new Date()).toTimeString();
  core.setOutput("time", time);
  // Get the JSON webhook payload for the event that triggered the workflow
} catch (error) {
  core.setFailed(error.message);
}