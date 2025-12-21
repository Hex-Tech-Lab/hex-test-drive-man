import { Octokit } from '@octokit/rest';
import * as fs from 'fs';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const REPO_OWNER = 'Hex-Tech-Lab';
const REPO_NAME = 'hex-test-drive-man';

if (!GITHUB_TOKEN) {
  console.error('❌ GITHUB_TOKEN environment variable required');
  console.error('   Usage: GITHUB_TOKEN=your_token pnpm exec tsx scripts/comprehensive-pr-scraper.ts');
  console.error('   Or: source credentials.env && pnpm exec tsx scripts/comprehensive-pr-scraper.ts');
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

// Review tools (ALL - including Corridor)
const REVIEW_TOOLS = {
  coderabbitai: 'CodeRabbit AI',
  'sourcery-ai': 'Sourcery',
  sonarcloud: 'Sonar',
  'snyk-bot': 'Snyk',
  corridor: 'Corridor',
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
  pr_closed_at?: string;
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
  finding_type: 'inline_code' | 'security' | 'architecture' | 'summary';
  comment_id: number;
  comment_url: string;
  is_security: boolean;
}

interface ComprehensiveReport {
  generated_at: string;
  metadata: {
    prs_scanned: number;
    open_prs: number;
    closed_prs_24h: number;
    timeframe: string;
  };
  total_findings: number;
  by_severity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  by_type: {
    inline_code: number;
    security: number;
    architecture: number;
    summary: number;
  };
  findings_by_pr: {
    [prNumber: number]: {
      pr_info: {
        number: number;
        title: string;
        author: string;
        state: string;
        closed_at?: string;
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
    pr_state: string;
    severity: string;
    task: string;
    files: string[];
    effort: string;
    tool: string;
    ai_prompt?: string;
    category: string;
    finding_type: string;
  }>;
}

async function getAllRelevantPRs() {
  // Get open PRs
  const { data: openPRs } = await octokit.pulls.list({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    state: 'open',
    per_page: 100,
  });

  // Get closed PRs from last 24 hours
  const oneDayAgo = new Date();
  oneDayAgo.setHours(oneDayAgo.getHours() - 24);

  const { data: closedPRs } = await octokit.pulls.list({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    state: 'closed',
    sort: 'updated',
    direction: 'desc',
    per_page: 50,
  });

  // Filter closed PRs to only include those closed in last 24h
  const recentClosedPRs = closedPRs.filter(pr => {
    if (!pr.closed_at) return false;
    const closedDate = new Date(pr.closed_at);
    return closedDate >= oneDayAgo;
  });

  console.log(`📊 Found ${openPRs.length} open PRs`);
  console.log(`📊 Found ${recentClosedPRs.length} PRs closed in last 24h`);

  return {
    all: [...openPRs, ...recentClosedPRs],
    openCount: openPRs.length,
    closedCount: recentClosedPRs.length,
  };
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
  const securityKeywords = ['security', 'credential', 'token', 'password', 'secret', 'api key', 'vulnerability'];
  const bodyLower = body.toLowerCase();

  // Corridor is security-focused
  if (tool.includes('corridor')) return true;

  return securityKeywords.some(kw => bodyLower.includes(kw));
}

function determineFindingType(comment: any, body: string): 'inline_code' | 'security' | 'architecture' | 'summary' {
  // Inline code review (has specific file + line)
  if (comment.path && (comment.line || comment.original_line)) {
    return 'inline_code';
  }

  // Security finding
  if (isSecurity(body, '')) {
    return 'security';
  }

  // Architecture (general comment on PR without specific line)
  const bodyLower = body.toLowerCase();
  if (bodyLower.includes('architecture') || bodyLower.includes('design') || bodyLower.includes('pattern')) {
    return 'architecture';
  }

  // Summary/general review
  return 'summary';
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

function determineScope(title: string, findings: PRFinding[]): string {
  const titleLower = title.toLowerCase();

  if (titleLower.includes('otp') || titleLower.includes('sms')) return 'OTP/SMS System';
  if (titleLower.includes('booking')) return 'Booking System';
  if (titleLower.includes('image')) return 'Image Management';
  if (titleLower.includes('upgrade') || titleLower.includes('dependency')) return 'Dependency Upgrade';
  if (findings.some(f => f.category === 'security')) return 'Security';

  return 'General';
}

async function scrapeAllPRs(): Promise<ComprehensiveReport> {
  console.log('🔍 Fetching open + recently closed PRs...');
  const { all: prs, openCount, closedCount } = await getAllRelevantPRs();

  const report: ComprehensiveReport = {
    generated_at: new Date().toISOString(),
    metadata: {
      prs_scanned: prs.length,
      open_prs: openCount,
      closed_prs_24h: closedCount,
      timeframe: '24 hours',
    },
    total_findings: 0,
    by_severity: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    },
    by_type: {
      inline_code: 0,
      security: 0,
      architecture: 0,
      summary: 0,
    },
    findings_by_pr: {},
    prioritized_actions: [],
  };

  for (const pr of prs) {
    const prState = pr.state + (pr.merged_at ? ' (merged)' : '');
    console.log(`\n📊 Scraping PR #${pr.number} [${prState}]: ${pr.title}`);

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
      const findingType = determineFindingType(comment, body);

      findings.push({
        pr_number: pr.number,
        pr_title: pr.title,
        pr_author: pr.user?.login || '',
        pr_labels: pr.labels.map(l => l.name),
        pr_state: prState,
        pr_closed_at: pr.closed_at || undefined,
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
        finding_type: findingType,
        comment_id: comment.id,
        comment_url: commentUrl,
        is_security: false,
      });

      // Update type counts
      report.by_type[findingType]++;
    }

    // Calculate summary
    const byTool: { [tool: string]: number } = {};
    findings.forEach(f => {
      byTool[f.tool_name] = (byTool[f.tool_name] || 0) + 1;
    });

    const criticalCount = findings.filter(f => f.severity_rank === 1).length;
    const highCount = findings.filter(f => f.severity_rank === 2).length;
    const mediumCount = findings.filter(f => f.severity_rank === 3).length;
    const lowCount = findings.filter(f => f.severity_rank >= 4).length;

    report.findings_by_pr[pr.number] = {
      pr_info: {
        number: pr.number,
        title: pr.title,
        author: pr.user?.login || '',
        state: prState,
        closed_at: pr.closed_at || undefined,
        labels: pr.labels.map(l => l.name),
        url: pr.html_url,
        scope: determineScope(pr.title, findings),
      },
      findings,
      summary: {
        total: findings.length,
        critical: criticalCount,
        high: highCount,
        medium: mediumCount,
        low: lowCount,
        by_tool: byTool,
        estimated_effort: calculateTotalEffort(findings),
      },
    };

    // Update severity counts
    report.by_severity.critical += criticalCount;
    report.by_severity.high += highCount;
    report.by_severity.medium += mediumCount;
    report.by_severity.low += lowCount;

    console.log(`  ✅ Found ${findings.length} findings (${criticalCount} critical, ${highCount} high)`);
  }

  // Generate prioritized action list (all PRs combined)
  const allFindings: PRFinding[] = [];
  for (const prData of Object.values(report.findings_by_pr)) {
    allFindings.push(...prData.findings);
  }

  report.total_findings = allFindings.length;

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
    pr_state: f.pr_state,
    severity: f.severity,
    task: f.recommendation.split('\n')[0].substring(0, 150),
    files: f.file ? [f.file] : [],
    effort: f.effort_estimate || 'unknown',
    tool: f.tool_name,
    ai_prompt: f.ai_prompt,
    category: f.category,
    finding_type: f.finding_type,
  }));

  return report;
}

// Execute
scrapeAllPRs().then(report => {
  // Save full JSON report
  fs.writeFileSync(
    '/tmp/comprehensive_pr_findings.json',
    JSON.stringify(report, null, 2)
  );

  // Generate comprehensive Markdown report
  let md = `# 🎯 Comprehensive PR Review Findings\n\n`;
  md += `**Generated**: ${report.generated_at}\n`;
  md += `**PRs Scanned**: ${report.metadata.prs_scanned} (${report.metadata.open_prs} open, ${report.metadata.closed_prs_24h} closed in last 24h)\n`;
  md += `**Total Findings**: ${report.total_findings}\n\n`;

  md += `## 📊 Summary Statistics\n\n`;
  md += `### By Severity\n`;
  md += `- 🔴 **Critical**: ${report.by_severity.critical}\n`;
  md += `- 🟠 **High**: ${report.by_severity.high}\n`;
  md += `- 🟡 **Medium**: ${report.by_severity.medium}\n`;
  md += `- 🟢 **Low**: ${report.by_severity.low}\n\n`;

  md += `### By Type\n`;
  md += `- 💻 **Inline Code**: ${report.by_type.inline_code}\n`;
  md += `- 🔒 **Security**: ${report.by_type.security}\n`;
  md += `- 🏗️ **Architecture**: ${report.by_type.architecture}\n`;
  md += `- 📝 **Summary**: ${report.by_type.summary}\n\n`;

  md += `## 📋 Findings by PR\n\n`;
  md += `| PR # | State | Title | Scope | Findings | Critical | High | Medium | Low |\n`;
  md += `|------|-------|-------|-------|----------|----------|------|--------|-----|\n`;

  for (const [prNum, prData] of Object.entries(report.findings_by_pr)) {
    const state = prData.pr_info.state.includes('merged') ? '✅' : prData.pr_info.state === 'open' ? '🟢' : '🔴';
    md += `| #${prNum} | ${state} | ${prData.pr_info.title} | ${prData.pr_info.scope} | ${prData.summary.total} | ${prData.summary.critical} | ${prData.summary.high} | ${prData.summary.medium} | ${prData.summary.low} |\n`;
  }

  md += `\n## 🚨 Prioritized Implementation Plan\n\n`;
  md += `**Instructions**: Execute in order, top to bottom. AI prompts marked with ✅ can be auto-applied.\n\n`;

  // Group by severity for implementation plan
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

    const emoji = severity === 'critical' ? '🔴' : severity === 'high' ? '🟠' : severity === 'medium' ? '🟡' : '🟢';
    md += `\n### ${emoji} ${severity.toUpperCase()} Priority (${actions.length} items)\n\n`;
    md += `| Rank | PR | State | Type | Task | Tool | Effort | AI |\n`;
    md += `|------|-------|-------|------|------|------|--------|----|\n`;

    for (const action of actions) {
      const stateIcon = action.pr_state.includes('merged') ? '✅' : action.pr_state === 'open' ? '🟢' : '🔴';
      const typeIcon = action.finding_type === 'inline_code' ? '💻' :
                       action.finding_type === 'security' ? '🔒' :
                       action.finding_type === 'architecture' ? '🏗️' : '📝';
      const promptPreview = action.ai_prompt ? `✅` : '—';
      md += `| ${action.rank} | #${action.pr_number} | ${stateIcon} | ${typeIcon} | ${action.task} | ${action.tool} | ${action.effort} | ${promptPreview} |\n`;
    }
  }

  md += `\n## 🔧 Findings by Review Tool\n\n`;
  const toolCounts: { [tool: string]: number } = {};
  report.prioritized_actions.forEach(a => {
    toolCounts[a.tool] = (toolCounts[a.tool] || 0) + 1;
  });

  for (const [tool, count] of Object.entries(toolCounts).sort((a, b) => b[1] - a[1])) {
    md += `- **${tool}**: ${count} findings\n`;
  }

  md += `\n---\n\n`;
  md += `**Next Steps**:\n`;
  md += `1. Review CRITICAL items immediately\n`;
  md += `2. Apply AI-prompted fixes where available (✅ in AI column)\n`;
  md += `3. Schedule HIGH priority items for current sprint\n`;
  md += `4. Defer MEDIUM/LOW to backlog unless blocking\n`;

  fs.writeFileSync('/tmp/comprehensive_pr_findings.md', md);

  console.log('\n✅ Comprehensive reports generated:');
  console.log('  - /tmp/comprehensive_pr_findings.json (full data)');
  console.log('  - /tmp/comprehensive_pr_findings.md (implementation plan)');
  console.log(`\n📊 Total findings: ${report.total_findings}`);
  console.log(`   Critical: ${report.by_severity.critical}`);
  console.log(`   High: ${report.by_severity.high}`);
  console.log(`   Medium: ${report.by_severity.medium}`);
  console.log(`   Low: ${report.by_severity.low}`);
  console.log(`\n📊 By type:`);
  console.log(`   Inline Code: ${report.by_type.inline_code}`);
  console.log(`   Security: ${report.by_type.security}`);
  console.log(`   Architecture: ${report.by_type.architecture}`);
  console.log(`   Summary: ${report.by_type.summary}`);
}).catch(error => {
  console.error('❌ Error running scraper:', error);
  process.exit(1);
});
