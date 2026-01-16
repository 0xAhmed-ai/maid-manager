// GitHub integration script to create repo and push code
import { Octokit } from '@octokit/rest';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

async function createRepo() {
  const octokit = await getUncachableGitHubClient();
  
  // Get authenticated user
  const { data: user } = await octokit.users.getAuthenticated();
  console.log(`Authenticated as: ${user.login}`);
  
  const repoName = 'maid-manager';
  
  try {
    // Create the repository
    const { data: repo } = await octokit.repos.createForAuthenticatedUser({
      name: repoName,
      description: 'Multilingual maid management mobile app with React Native/Expo and Supabase backend',
      private: false,
      auto_init: false,
    });
    
    console.log(`Repository created: ${repo.html_url}`);
    console.log(`Clone URL: ${repo.clone_url}`);
    
    return { username: user.login, repoName, repoUrl: repo.html_url };
  } catch (error: any) {
    if (error.status === 422) {
      console.log(`Repository '${repoName}' already exists for user ${user.login}`);
      return { username: user.login, repoName, repoUrl: `https://github.com/${user.login}/${repoName}` };
    }
    throw error;
  }
}

createRepo()
  .then(result => {
    console.log('\nRepository ready!');
    console.log(`URL: ${result.repoUrl}`);
    console.log(`\nTo push your code, run:`);
    console.log(`git remote add origin https://github.com/${result.username}/${result.repoName}.git`);
    console.log(`git push -u origin main`);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
