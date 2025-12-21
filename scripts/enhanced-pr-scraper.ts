import { Octokit } from '@octokit/rest';
import * as fs from 'fs';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const REPO_OWNER = 'Hex-Tech-Lab';
const REPO_NAME = 'hex-test-drive-man';

if (!GITHUB_TOKEN) {
  console.error('❌ GITHUB_TOKEN environment variable required');
  console.error('   Usage: GITHUB_TOKEN=your_token npx ts-node scripts/enhanced-pr-scraper.ts');
  console.error('   Or: source credentials.env && npx ts-node scripts/enhanced-pr-scraper.ts');
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

// Review tools (ALL - including Corridor)
const REVIEW_TOOLS = {
  coderabbitai: 'CodeRabbit AI',
  'sourcery-ai': 'Sourcery',
  sonarcloud: 'Sonar',
  'snyk-bot': 'Snyk',
  corridor: 'Corridor',           // Security bot
  'corridor-app': 'Corridor',
  'sentry-io': 'Sentry',
  vercel: 'Vercel Bot',
  'github-actions': 'GitHub Actions',
};

// GitHub severity mapping
const SEVERITY_MAP = {
  critical: 1,
  blocker: 1,
  high: 2,
  major: 2,
  medium: 3,
  moderate: 3,
  low: 4,
  minor: 4,
  trivial: 5,
  info: 5,
};

interface PRFinding {
  pr_number: number;
  pr_title: string;
  pr_author: string;
  pr_labels: string[];
  pr_state: string;
  tool: string;
  tool_name: string;
  severity: string;
  severity_rank: number;
  file: string;
  lines: string;
  issue: string;
  recommendation: string;
  effort_estimate?: string;
  complexity?: string;
  ai_prompt?: string;
  category: string;
  comment_id: number;
  comment_url: string;
  is_security: boolean;
}

interface PRReport {
  generated_at: string;
  total_prs: number;
  open_prs: number;
  findings_by_pr: {
    [prNumber: number]: {
      pr_info: {
        number: number;
        title: string;
        author: string;
        state: string;
        labels: string[];
        url: string;
        scope: string;
      };
      findings: PRFinding[];
      summary: {
        total: number;
        critical: number;
        high: number;
        medium: number;
        low: number;
        by_tool: { [tool: string]: number };
        estimated_effort: string;
      };
    };
  };
  prioritized_actions: Array<{
    rank: number;
    pr_number: number;
    pr_title: string;
    severity: string;
    task: string;
    files: string[];
    effort: string;
    tool: string;
    ai_prompt?: string;
    category: string;
  }>;
}

async function getAllOpenPRs() {
  const { data: prs } = await octokit.pulls.list({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    state: 'open',
    per_page: 100,
  });
  return prs;
}

async function getPRComments(prNumber: number) {
  const [comments, reviewComments, reviews] = await Promise.all([
    octokit.issues.listComments({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      issue_number: prNumber,
    }),
    octokit.pulls.listReviewComments({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      pull_number: prNumber,
    }),
    octokit.pulls.listReviews({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      pull_number: prNumber,
    }),
  ]);

  return {
    comments: comments.data,
    reviewComments: reviewComments.data,
    reviews: reviews.data,
  };
}

function extractSeverity(body: string, labels: string[]): { severity: string; rank: number } {
  // Check labels first
  for (const label of labels) {
    const labelLower = label.toLowerCase();
    for (const [sev, rank] of Object.entries(SEVERITY_MAP)) {
      if (labelLower.includes(sev)) {
        return { severity: sev, rank };
      }
    }
  }

  // Check body text
  const bodyLower = body.toLowerCase();
  if (bodyLower.match(/critical|blocker/i)) return { severity: 'critical', rank: 1 };
  if (bodyLower.match(/major|high|important/i)) return { severity: 'high', rank: 2 };
  if (bodyLower.match(/medium|moderate/i)) return { severity: 'medium', rank: 3 };
  if (bodyLower.match(/low|minor/i)) return { severity: 'low', rank: 4 };
  return { severity: 'trivial', rank: 5 };
}

function identifyTool(author: string, body: string): { tool: string; name: string } {
  for (const [key, name] of Object.entries(REVIEW_TOOLS)) {
    if (author.toLowerCase().includes(key) || body.toLowerCase().includes(name.toLowerCase())) {
      return { tool: key, name };
    }
  }
  return { tool: 'unknown', name: 'Unknown' };
}

function isSecurity(body: string, tool: string): boolean {
  const securityKeywords = ['security', 'credential', 'token', 'password', 'secret', 'api key'];
  const bodyLower = body.toLowerCase();

  // Corridor is security-focused
  if (tool.includes('corridor')) return true;

  return securityKeywords.some(kw => bodyLower.includes(kw));
}

function extractAIPrompt(body: string): string | undefined {
  // CodeRabbit suggestions
  const suggestionMatch = body.match(/```suggestion\n([\s\S]*?)```/);
  if (suggestionMatch) return suggestionMatch[1].trim();

  // Generic code blocks
  const codeMatch = body.match(/```[\w]*\n([\s\S]*?)```/);
  if (codeMatch) return codeMatch[1].trim();

  return undefined;
}

function extractEffort(body: string): string | undefined {
  const effortMatch = body.match(/(?:effort|time|duration):\s*(\d+\s*(?:min|hour|day)s?)/i);
  return effortMatch ? effortMatch[1] : undefined;
}

function extractComplexity(body: string): string | undefined {
  const complexityMatch = body.match(/complexity:\s*(\w+)/i);
  return complexityMatch ? complexityMatch[1].toLowerCase() : undefined;
}

function categorizeFinding(body: string): string {
  const bodyLower = body.toLowerCase();
  if (bodyLower.includes('performance')) return 'performance';
  if (bodyLower.includes('security')) return 'security';
  if (bodyLower.includes('bug') || bodyLower.includes('error')) return 'bug';
  if (bodyLower.includes('refactor')) return 'refactoring';
  if (bodyLower.includes('test')) return 'testing';
  if (bodyLower.includes('documentation') || bodyLower.includes('docs')) return 'documentation';
  return 'code_quality';
}

function calculateTotalEffort(findings: PRFinding[]): string {
  let totalMinutes = 0;
  for (const f of findings) {
    if (f.effort_estimate) {
      const match = f.effort_estimate.match(/(\d+)\s*(min|hour|day)/);
      if (match) {
        const value = parseInt(match[1]);
        const unit = match[2];
        if (unit === 'day') totalMinutes += value * 480;
        else if (unit === 'hour') totalMinutes += value * 60;
        else totalMinutes += value;
      }
    }
  }

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

async function scrapeAllPRs(): Promise<PRReport> {
  console.log('🔍 Fetching all open PRs...');
  const prs = await getAllOpenPRs();
  console.log(`Found ${prs.length} open PRs`);

  const report: PRReport = {
    generated_at: new Date().toISOString(),
    total_prs: prs.length,
    open_prs: prs.length,
    findings_by_pr: {},
    prioritized_actions: [],
  };

  for (const pr of prs) {
    console.log(`\n📊 Scraping PR #${pr.number}: ${pr.title}`);

    const { comments, reviewComments, reviews } = await getPRComments(pr.number);
    const allComments = [...comments, ...reviewComments];

    const findings: PRFinding[] = [];

    for (const comment of allComments) {
      const author = comment.user?.login || '';
      const body = comment.body || '';
      const commentUrl = comment.html_url || '';

      const { tool, name: toolName } = identifyTool(author, body);
      const isSec = isSecurity(body, tool);

      // Skip security findings (per user directive) but count them
      if (isSec) {
        console.log(`  ⏭️  Skipping security finding from ${toolName}`);
        continue;
      }

      const { severity, rank } = extractSeverity(body, pr.labels.map(l => l.name));

      findings.push({
        pr_number: pr.number,
        pr_title: pr.title,
        pr_author: pr.user?.login || '',
        pr_labels: pr.labels.map(l => l.name),
        pr_state: pr.state,
        tool,
        tool_name: toolName,
        severity,
        severity_rank: rank,
        file: (comment as any).path || '',
        lines: ((comment as any).line || (comment as any).original_line || '').toString(),
        issue: body.split('\n')[0].substring(0, 200),
        recommendation: body.substring(0, 300),
        effort_estimate: extractEffort(body),
        complexity: extractComplexity(body),
        ai_prompt: extractAIPrompt(body),
        category: categorizeFinding(body),
        comment_id: comment.id,
        comment_url: commentUrl,
        is_security: false,
      });
    }

    // Calculate summary
    const byTool: { [tool: string]: number } = {};
    findings.forEach(f => {
      byTool[f.tool_name] = (byTool[f.tool_name] || 0) + 1;
    });

    report.findings_by_pr[pr.number] = {
      pr_info: {
        number: pr.number,
        title: pr.title,
        author: pr.user?.login || '',
        state: pr.state,
        labels: pr.labels.map(l => l.name),
        url: pr.html_url,
        scope: determineScope(pr.title, findings),
      },
      findings,
      summary: {
        total: findings.length,
        critical: findings.filter(f => f.severity_rank === 1).length,
        high: findings.filter(f => f.severity_rank === 2).length,
        medium: findings.filter(f => f.severity_rank === 3).length,
        low: findings.filter(f => f.severity_rank >= 4).length,
        by_tool: byTool,
        estimated_effort: calculateTotalEffort(findings),
      },
    };

    console.log(`  ✅ Found ${findings.length} findings`);
  }

  // Generate prioritized action list (all PRs combined)
  const allFindings: PRFinding[] = [];
  for (const prData of Object.values(report.findings_by_pr)) {
    allFindings.push(...prData.findings);
  }

  // Sort by severity rank, then by effort
  allFindings.sort((a, b) => {
    if (a.severity_rank !== b.severity_rank) {
      return a.severity_rank - b.severity_rank;
    }
    // If same severity, prioritize items with AI prompts
    if (a.ai_prompt && !b.ai_prompt) return -1;
    if (!a.ai_prompt && b.ai_prompt) return 1;
    return 0;
  });

  report.prioritized_actions = allFindings.map((f, idx) => ({
    rank: idx + 1,
    pr_number: f.pr_number,
    pr_title: f.pr_title,
    severity: f.severity,
    task: f.recommendation.split('\n')[0].substring(0, 150),
    files: f.file ? [f.file] : [],
    effort: f.effort_estimate || 'unknown',
    tool: f.tool_name,
    ai_prompt: f.ai_prompt,
    category: f.category,
  }));

  return report;
}

function determineScope(title: string, findings: PRFinding[]): string {
  const titleLower = title.toLowerCase();

  if (titleLower.includes('otp') || titleLower.includes('sms')) return 'OTP/SMS System';
  if (titleLower.includes('booking')) return 'Booking System';
  if (titleLower.includes('image')) return 'Image Management';
  if (titleLower.includes('upgrade') || titleLower.includes('dependency')) return 'Dependency Upgrade';
  if (findings.some(f => f.category === 'security')) return 'Security';

  return 'General';
}

// Execute
scrapeAllPRs().then(report => {
  // Save full JSON report
  fs.writeFileSync(
    '/tmp/pr_review_complete.json',
    JSON.stringify(report, null, 2)
  );

  // Generate prioritized Markdown report
  let md = `# 🎯 PR Review Action Roster\n\n`;
  md += `**Generated**: ${report.generated_at}\n`;
  md += `**Total PRs**: ${report.total_prs}\n\n`;

  md += `## 📊 Summary by PR\n\n`;
  md += `| PR # | Title | Scope | Findings | Critical | High | Medium | Low |\n`;
  md += `|------|-------|-------|----------|----------|------|--------|-----|\n`;

  for (const [prNum, prData] of Object.entries(report.findings_by_pr)) {
    md += `| #${prNum} | ${prData.pr_info.title} | ${prData.pr_info.scope} | ${prData.summary.total} | ${prData.summary.critical} | ${prData.summary.high} | ${prData.summary.medium} | ${prData.summary.low} |\n`;
  }

  md += `\n## 🚨 Prioritized Actions (Severity-Sorted)\n\n`;

  // Group by severity
  const bySeverity: { [sev: string]: typeof report.prioritized_actions } = {
    critical: [],
    high: [],
    medium: [],
    low: [],
  };

  report.prioritized_actions.forEach(action => {
    const sevGroup = action.severity === 'blocker' ? 'critical' :
                     action.severity === 'major' ? 'high' :
                     action.severity in bySeverity ? action.severity : 'low';
    bySeverity[sevGroup].push(action);
  });

  for (const [severity, actions] of Object.entries(bySeverity)) {
    if (actions.length === 0) continue;

    md += `\n### ${severity.toUpperCase()} Priority (${actions.length} items)\n\n`;
    md += `| Rank | PR | Task | Tool | Effort | AI Prompt |\n`;
    md += `|------|----|----- |------|--------|----------|\n`;

    for (const action of actions) {
      const promptPreview = action.ai_prompt ? `✅ Available` : '—';
      md += `| ${action.rank} | #${action.pr_number} | ${action.task} | ${action.tool} | ${action.effort} | ${promptPreview} |\n`;
    }
  }

  md += `\n## 🔧 By Tool\n\n`;
  const toolCounts: { [tool: string]: number } = {};
  report.prioritized_actions.forEach(a => {
    toolCounts[a.tool] = (toolCounts[a.tool] || 0) + 1;
  });

  for (const [tool, count] of Object.entries(toolCounts).sort((a, b) => b[1] - a[1])) {
    md += `- **${tool}**: ${count} findings\n`;
  }

  fs.writeFileSync('/tmp/pr_action_roster.md', md);

  console.log('\n✅ Reports generated:');
  console.log('  - /tmp/pr_review_complete.json (full data)');
  console.log('  - /tmp/pr_action_roster.md (prioritized actions)');
  console.log(`\n📊 Total findings: ${report.prioritized_actions.length}`);
  console.log(`   Critical: ${bySeverity.critical.length}`);
  console.log(`   High: ${bySeverity.high.length}`);
  console.log(`   Medium: ${bySeverity.medium.length}`);
  console.log(`   Low: ${bySeverity.low.length}`);
});
