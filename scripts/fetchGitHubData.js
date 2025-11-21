const fs = require('fs');
const path = require('path');

const GITHUB_USERNAME = 'humisan';

async function fetchGitHubData() {
  try {
    console.log(`🐙 Fetching GitHub statistics for @${GITHUB_USERNAME}...`);

    // Fetch user data
    const userResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        ...(process.env.GITHUB_TOKEN && { 'Authorization': `token ${process.env.GITHUB_TOKEN}` }),
      },
    });

    if (!userResponse.ok) {
      console.error('❌ Failed to fetch user data:', userResponse.statusText);
      return null;
    }

    const userData = await userResponse.json();

    // Fetch repositories
    const reposResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?type=owner&sort=updated&per_page=100`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        ...(process.env.GITHUB_TOKEN && { 'Authorization': `token ${process.env.GITHUB_TOKEN}` }),
      },
    });

    if (!reposResponse.ok) {
      console.error('❌ Failed to fetch repositories:', reposResponse.statusText);
      return null;
    }

    const repos = await reposResponse.json();

    // Calculate statistics
    const stats = {
      username: userData.login,
      name: userData.name || userData.login,
      avatar: userData.avatar_url,
      bio: userData.bio,
      publicRepos: userData.public_repos,
      followers: userData.followers,
      following: userData.following,
      publicGists: userData.public_gists,
      location: userData.location,
      company: userData.company,
      blog: userData.blog,
      twitterUsername: userData.twitter_username,
      profileUrl: userData.html_url,
    };

    // Analyze language statistics
    const languageStats = {};
    let totalSize = 0;

    repos.forEach(repo => {
      if (!repo.fork && repo.language) {
        languageStats[repo.language] = (languageStats[repo.language] || 0) + repo.size;
        totalSize += repo.size;
      }
    });

    // Convert to percentages and sort
    const languages = Object.entries(languageStats)
      .map(([lang, size]) => ({
        name: lang,
        percentage: Math.round((size / totalSize) * 100),
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5); // Top 5 languages

    stats.topLanguages = languages;

    // Get top repositories
    stats.topRepositories = repos
      .filter(repo => !repo.fork)
      .slice(0, 3)
      .map(repo => ({
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        stars: repo.stargazers_count,
        language: repo.language,
        forks: repo.forks_count,
      }));

    // Create public directory if it doesn't exist
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Write data to public directory
    const dataPath = path.join(publicDir, 'github-data.json');
    fs.writeFileSync(dataPath, JSON.stringify(stats, null, 2));

    console.log('✅ GitHub data saved to public/github-data.json');
    console.log(`   User: ${stats.name} (@${stats.username})`);
    console.log(`   Repos: ${stats.publicRepos}, Followers: ${stats.followers}`);
    console.log(`   Top languages: ${languages.map(l => l.name).join(', ')}`);

    return stats;
  } catch (error) {
    console.error('❌ Error fetching GitHub data:', error.message);
    return null;
  }
}

// Run the fetch function
fetchGitHubData().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
