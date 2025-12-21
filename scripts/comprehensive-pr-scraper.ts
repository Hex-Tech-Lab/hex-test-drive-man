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

interface ComprehensiveFinding {
  pr_number: number;
  tool: string;
  type: 'inline_code' | 'summary' | 'security' | 'architecture' | 'effort' | 'related_pr';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  file?: string;
  lines?: string;
  issue: string;
  recommendation: string;
  effort_estimate?: string;
  complexity?: string;
  related_pr?: number;
  ai_prompt?: string;
  comment_id: number;
  comment_url: string;
  full_text: string;
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

// Helper: Extract clean issue description from CodeRabbit/bot comments
function extractIssue(body: string): string {
  // Remove emoji prefixes and markdown formatting
  let cleaned = body.replace(/^[_*]*⚠️[_*]*\s*Potential issue[_*]*\s*\|?\s*[_*]*🔴[_*]*\s*Critical[_*]*/i, '');
  cleaned = cleaned.replace(/^[_*]*⚠️[_*]*\s*Potential issue[_*]*\s*\|?\s*[_*]*🟠[_*]*\s*High[_*]*/i, '');
  
  // Extract first meaningful line (before <details> or code blocks)
  const lines = cleaned.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && 
        !trimmed.startsWith('<') && 
        !trimmed.startsWith('#') &&
        !trimmed.startsWith('```') &&
        !trimmed.startsWith('---') &&
        trimmed.length > 20) {
      return trimmed.replace(/^\*\*(.+?)\*\*/, '$1').substring(0, 200);
    }
  }
  return body.substring(0, 150) + '...';
}

// Helper: Extract clean recommendation/solution
function extractRecommendation(body: string): string {
  // Look for "Add X to Y" or "Change X to Y" patterns
  const patterns = [
    /(?:Add|Create|Update|Change|Modify|Fix|Remove|Implement)\s+[^.]+/i,
    /Recommendation:\s*(.+?)(?:\n|$)/i,
    /Solution:\s*(.+?)(?:\n|$)/i,
  ];
  
  for (const pattern of patterns) {
    const match = body.match(pattern);
    if (match) {
      return match[0].trim().substring(0, 300);
    }
  }
  
  // Fallback: first sentence after removing HTML
  const cleaned = body.replace(/<details>[\s\S]*?<\/details>/g, '')
                      .replace(/<[^>]+>/g, '')
                      .replace(/```[\s\S]*?```/g, '')
                      .trim();
  
  const sentences = cleaned.split(/[.!?]\s+/);
  for (const sentence of sentences) {
    if (sentence.length > 30 && sentence.length < 400) {
      return sentence.trim() + '.';
    }
  }
  
  return cleaned.substring(0, 250) + '...';
}

// Helper: Extract AI prompt from CodeRabbit suggestions
function extractAIPrompt(body: string): string | undefined {
  const promptMatch = body.match(/🤖 Prompt for AI Agents[\s\S]*?```\s*([\s\S]+?)```/i) ||
                      body.match(/Prompt for AI[\s\S]*?```\s*([\s\S]+?)```/i) ||
                      body.match(/```suggestion\s*([\s\S]+?)```/i);
  
  if (promptMatch) {
    return promptMatch[1].trim().substring(0, 1000);
  }
  return undefined;
}

// Helper: Extract effort estimate from Sourcery comments
function extractEffort(body: string): string | undefined {
  const effortMatch = body.match(/Effort:\s*(\d+\s*(?:min|hour|day|week)s?)/i) ||
                      body.match(/Estimated\s+time:\s*(\d+\s*(?:min|hour|day|week)s?)/i) ||
                      body.match(/(?:Takes?|Should take)\s+(?:about\s+)?(\d+\s*(?:min|hour|day|week)s?)/i);
  
  if (effortMatch) {
    return effortMatch[1].trim();
  }
  return undefined;
}

// Helper: Extract complexity
function extractComplexity(body: string): string | undefined {
  const complexityMatch = body.match(/Complexity:\s*(high|medium|low)/i) ||
                          body.match(/(high|medium|low)\s+complexity/i);
  
  if (complexityMatch) {
    return complexityMatch[1].toLowerCase();
  }
  return undefined;
}

// Helper: Extract related PR references
function extractRelatedPRs(body: string): number | undefined {
  const prMatch = body.match(/(?:similar to|see|related to|like|as in)\s+#(\d+)/i) ||
                  body.match(/PR\s+#(\d+)/i);
  
  if (prMatch) {
    return parseInt(prMatch[1], 10);
  }
  return undefined;
}

// Helper: Classify finding type
function classifyType(body: string, tool: string): ComprehensiveFinding['type'] {
  const lowerBody = body.toLowerCase();
  
  // Check for explicit markers
  if (lowerBody.includes('effort:') || lowerBody.includes('estimated time:')) {
    return 'effort';
  }
  
  if (lowerBody.match(/similar to|related to|see pr #\d+/)) {
    return 'related_pr';
  }
  
  if (lowerBody.includes('architecture') || 
      lowerBody.includes('design pattern') ||
      lowerBody.includes('refactor')) {
    return 'architecture';
  }
  
  if (tool.toLowerCase().includes('corridor') ||
      tool.toLowerCase().includes('snyk') ||
      lowerBody.includes('security') ||
      lowerBody.includes('vulnerability') ||
      lowerBody.includes('credential') ||
      lowerBody.includes('rls') ||
      lowerBody.includes('idor')) {
    return 'security';
  }
  
  // Check if it's a top-level summary (no file/line reference)
  if (!body.match(/File:|Line \d+|lines? \d+/i)) {
    return 'summary';
  }
  
  return 'inline_code';
}

// Helper: Determine severity
function determineSeverity(body: string, path?: string): ComprehensiveFinding['severity'] {
  const lowerBody = body.toLowerCase();
  
  if (lowerBody.includes('🔴') || 
      lowerBody.includes('critical') ||
      lowerBody.includes('blocker') ||
      lowerBody.includes('security vulnerability')) {
    return 'critical';
  }
  
  if (lowerBody.includes('🟠') ||
      lowerBody.includes('high') ||
      lowerBody.includes('important') ||
      lowerBody.includes('data loss')) {
    return 'high';
  }
  
  if (lowerBody.includes('medium') || lowerBody.includes('moderate')) {
    return 'medium';
  }
  
  if (lowerBody.includes('low') || lowerBody.includes('minor')) {
    return 'low';
  }
  
  return 'info';
}

// Helper: Identify tool from comment author/body
function identifyTool(login: string, body: string): string {
  const lowerLogin = login.toLowerCase();
  const lowerBody = body.toLowerCase();
  
  if (lowerLogin.includes('coderabbit') || lowerBody.includes('coderabbit')) return 'CodeRabbit';
  if (lowerLogin.includes('sourcery') || lowerBody.includes('sourcery')) return 'Sourcery';
  if (lowerLogin.includes('corridor') || lowerBody.includes('corridor')) return 'Corridor';
  if (lowerLogin.includes('snyk') || lowerBody.includes('snyk')) return 'Snyk';
  if (lowerLogin.includes('sonar') || lowerBody.includes('sonar')) return 'Sonar';
  if (lowerLogin.includes('sentry') || lowerBody.includes('sentry')) return 'Sentry';
  
  return login;
}

async function scrapeComprehensive() {
  console.log('🚀 Starting comprehensive PR scrape...\n');
  
  // Get all open PRs
  const { data: openPRs } = await octokit.pulls.list({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    state: 'open',
    per_page: 100,
  });
  
  // Get recently closed PRs (last 24 hours)
  const { data: closedPRs } = await octokit.pulls.list({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    state: 'closed',
    sort: 'updated',
    direction: 'desc',
    per_page: 20,
  });
  
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentClosedPRs = closedPRs.filter(pr => 
    pr.closed_at && new Date(pr.closed_at) > oneDayAgo
  );
  
  // Filter out dependency PRs
  const excludePatterns = [/^\[Snyk\]/, /^Bump /, /^chore\(deps\)/];
  const allPRs = [...openPRs, ...recentClosedPRs].filter(pr => 
    !excludePatterns.some(pattern => pattern.test(pr.title))
  );
  
  console.log(`📊 PRs to scan: ${allPRs.length}`);
  console.log(`  - Open: ${openPRs.length}`);
  console.log(`  - Closed (24h): ${recentClosedPRs.length}`);
  console.log('');
  
  const findings: ComprehensiveFinding[] = [];
  
  for (const pr of allPRs) {
    console.log(`📝 Scanning PR #${pr.number}: ${pr.title}`);
    
    // Get all comment types
    const [issueComments, reviewComments, reviews] = await Promise.all([
      octokit.issues.listComments({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        issue_number: pr.number,
        per_page: 100,
      }),
      octokit.pulls.listReviewComments({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        pull_number: pr.number,
        per_page: 100,
      }),
      octokit.pulls.listReviews({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        pull_number: pr.number,
        per_page: 100,
      }),
    ]);
    
    // Process issue comments (top-level summaries)
    for (const comment of issueComments.data) {
      if (!comment.user || comment.user.type !== 'Bot') continue;
      
      const tool = identifyTool(comment.user.login, comment.body || '');
      const type = classifyType(comment.body || '', tool);
      const severity = determineSeverity(comment.body || '');
      
      findings.push({
        pr_number: pr.number,
        tool,
        type,
        severity,
        issue: extractIssue(comment.body || ''),
        recommendation: extractRecommendation(comment.body || ''),
        effort_estimate: extractEffort(comment.body || ''),
        complexity: extractComplexity(comment.body || ''),
        related_pr: extractRelatedPRs(comment.body || ''),
        ai_prompt: extractAIPrompt(comment.body || ''),
        comment_id: comment.id,
        comment_url: comment.html_url || '',
        full_text: comment.body || '',
      });
    }
    
    // Process review comments (inline code)
    for (const comment of reviewComments.data) {
      if (!comment.user || comment.user.type !== 'Bot') continue;
      
      const tool = identifyTool(comment.user.login, comment.body || '');
      const type = classifyType(comment.body || '', tool);
      const severity = determineSeverity(comment.body || '', comment.path);
      
      findings.push({
        pr_number: pr.number,
        tool,
        type,
        severity,
        file: comment.path,
        lines: comment.line?.toString() || comment.original_line?.toString(),
        issue: extractIssue(comment.body || ''),
        recommendation: extractRecommendation(comment.body || ''),
        effort_estimate: extractEffort(comment.body || ''),
        complexity: extractComplexity(comment.body || ''),
        related_pr: extractRelatedPRs(comment.body || ''),
        ai_prompt: extractAIPrompt(comment.body || ''),
        comment_id: comment.id,
        comment_url: comment.html_url || '',
        full_text: comment.body || '',
      });
    }
    
    // Process review summaries
    for (const review of reviews.data) {
      if (!review.user || review.user.type !== 'Bot' || !review.body) continue;
      
      const tool = identifyTool(review.user.login, review.body);
      const type = classifyType(review.body, tool);
      const severity = determineSeverity(review.body);
      
      findings.push({
        pr_number: pr.number,
        tool,
        type,
        severity,
        issue: extractIssue(review.body),
        recommendation: extractRecommendation(review.body),
        effort_estimate: extractEffort(review.body),
        complexity: extractComplexity(review.body),
        related_pr: extractRelatedPRs(review.body),
        ai_prompt: extractAIPrompt(review.body),
        comment_id: review.id,
        comment_url: review.html_url || '',
        full_text: review.body,
      });
    }
  }
  
  // Generate report
  const bySeverity = {
    critical: findings.filter(f => f.severity === 'critical').length,
    high: findings.filter(f => f.severity === 'high').length,
    medium: findings.filter(f => f.severity === 'medium').length,
    low: findings.filter(f => f.severity === 'low').length,
    info: findings.filter(f => f.severity === 'info').length,
  };
  
  const byType = {
    inline_code: findings.filter(f => f.type === 'inline_code').length,
    summary: findings.filter(f => f.type === 'summary').length,
    security: findings.filter(f => f.type === 'security').length,
    architecture: findings.filter(f => f.type === 'architecture').length,
    effort: findings.filter(f => f.type === 'effort').length,
    related_pr: findings.filter(f => f.type === 'related_pr').length,
  };
  
  const report = {
    metadata: {
      generated_at: new Date().toISOString(),
      prs_scanned: allPRs.length,
      prs_open: openPRs.length,
      prs_closed_recent: recentClosedPRs.length,
    },
    total_findings: findings.length,
    by_severity: bySeverity,
    by_type: byType,
    findings: findings.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    }),
  };
  
  // Save JSON
  const jsonPath = '/tmp/comprehensive_pr_findings.json';
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  console.log(`\n✅ JSON saved: ${jsonPath}`);
  
  // Generate clean markdown (like v3.md template)
  const mdPath = '/tmp/comprehensive_pr_findings.md';
  let markdown = `# Actionable Implementation Plan from PR Reviews (v3 - Multi-PR)\n\n`;
  markdown += `**Generated**: ${report.metadata.generated_at}\n`;
  markdown += `**PRs Scanned**: ${report.metadata.prs_scanned} (${report.metadata.prs_open} open, ${report.metadata.prs_closed_recent} recently closed)\n`;
  markdown += `**Total Findings**: ${report.total_findings}\n\n`;
  markdown += `## Summary by Severity\n`;
  markdown += `- Critical: ${bySeverity.critical}\n`;
  markdown += `- High: ${bySeverity.high}\n`;
  markdown += `- Medium: ${bySeverity.medium}\n`;
  markdown += `- Low: ${bySeverity.low}\n`;
  markdown += `- Info: ${bySeverity.info}\n\n`;
  
  // Critical findings
  const criticalFindings = findings.filter(f => f.severity === 'critical');
  if (criticalFindings.length > 0) {
    markdown += `## 1. Critical Implementation Tasks (${criticalFindings.length})\n\n`;
    markdown += `**Priority**: Highest. These must be fixed before any other work.\n\n`;
    markdown += `---\n\n`;
    
    criticalFindings.forEach((f, idx) => {
      markdown += `### 1.${idx + 1}. [CRITICAL] ${f.issue}\n`;
      markdown += `- **PR**: #${f.pr_number}\n`;
      markdown += `- **Tool**: ${f.tool}\n`;
      markdown += `- **Focus Area**: ${f.type.replace('_', ' ').toUpperCase()}\n`;
      if (f.file) markdown += `- **File**: ${f.file}${f.lines ? ` (Line ${f.lines})` : ''}\n`;
      if (f.effort_estimate) markdown += `- **Effort/ETA**: ${f.effort_estimate}\n`;
      if (f.complexity) markdown += `- **Complexity**: ${f.complexity}\n`;
      markdown += `- **Impact**: BLOCKER\n`;
      markdown += `- **AI Solution Available**: ${f.ai_prompt ? 'Yes' : 'No'}\n\n`;
      markdown += `#### Implementation Plan:\n`;
      markdown += `${f.recommendation}\n\n`;
      
      if (f.ai_prompt) {
        markdown += `<details>\n<summary>🤖 AI Agent Prompt</summary>\n\n\`\`\`\n${f.ai_prompt}\n\`\`\`\n\n</details>\n\n`;
      }
      
      markdown += `- **URL**: [View Comment](${f.comment_url})\n\n`;
      markdown += `---\n\n`;
    });
  }
  
  // High findings
  const highFindings = findings.filter(f => f.severity === 'high');
  if (highFindings.length > 0) {
    markdown += `## 2. High-Impact Implementation Tasks (${highFindings.length})\n\n`;
    markdown += `**Priority**: High. Fix after all Criticals are resolved.\n\n`;
    markdown += `---\n\n`;
    
    highFindings.forEach((f, idx) => {
      markdown += `### 2.${idx + 1}. [HIGH] ${f.issue}\n`;
      markdown += `- **PR**: #${f.pr_number}\n`;
      markdown += `- **Tool**: ${f.tool}\n`;
      if (f.file) markdown += `- **File**: ${f.file}${f.lines ? ` (Line ${f.lines})` : ''}\n`;
      if (f.effort_estimate) markdown += `- **Effort/ETA**: ${f.effort_estimate}\n`;
      markdown += `\n${f.recommendation}\n\n`;
      
      if (f.ai_prompt) {
        markdown += `<details>\n<summary>🤖 AI Agent Prompt</summary>\n\n\`\`\`\n${f.ai_prompt}\n\`\`\`\n\n</details>\n\n`;
      }
      
      markdown += `- **URL**: [View Comment](${f.comment_url})\n\n`;
      markdown += `---\n\n`;
    });
  }
  
  fs.writeFileSync(mdPath, markdown);
  console.log(`✅ Markdown saved: ${mdPath}\n`);
  
  return report;
}

scrapeComprehensive().catch(console.error);
