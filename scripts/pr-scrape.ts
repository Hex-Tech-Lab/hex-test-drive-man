#!/usr/bin/env tsx
/**
 * PR Review Scraper
 * 
 * Fetches PR comments from automated review tools (CodeRabbit, Sourcery, Sonar, Snyk, Sentry)
 * and generates a classified analysis report.
 * 
 * Usage: pnpm run pr:scrape <PR_NUMBER>
 * Output: docs/PR_<NUMBER>_REVIEW_ANALYSIS.md
 */

import { config } from 'dotenv';
config({ path: '.env.local' });
import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'Hex-Tech-Lab';
const GITHUB_REPO = process.env.GITHUB_REPO || 'hex-test-drive-man';

if (!GITHUB_TOKEN) {
  console.error('❌ GITHUB_TOKEN environment variable not set');
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

interface ReviewComment {
  id: number;
  user: string;
  body: string;
  created_at: string;
  path?: string;
  line?: number;
}

interface ClassifiedIssue {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  tool: string;
  message: string;
  file?: string;
  line?: number;
}

/**
 * Classify issue severity based on keywords
 */
function classifySeverity(body: string): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
  const lowerBody = body.toLowerCase();
  
  // CRITICAL: Security vulnerabilities, data loss, breaking changes
  if (
    lowerBody.includes('security') ||
    lowerBody.includes('vulnerability') ||
    lowerBody.includes('critical') ||
    lowerBody.includes('data loss') ||
    lowerBody.includes('breaking change')
  ) {
    return 'CRITICAL';
  }
  
  // HIGH: Performance issues, logic errors, type errors
  if (
    lowerBody.includes('performance') ||
    lowerBody.includes('memory leak') ||
    lowerBody.includes('type error') ||
    lowerBody.includes('logic error') ||
    lowerBody.includes('bug')
  ) {
    return 'HIGH';
  }
  
  // MEDIUM: Code quality, maintainability
  if (
    lowerBody.includes('refactor') ||
    lowerBody.includes('complexity') ||
    lowerBody.includes('duplication') ||
    lowerBody.includes('maintainability')
  ) {
    return 'MEDIUM';
  }
  
  // LOW: Style, formatting, minor suggestions
  return 'LOW';
}

/**
 * Identify tool from comment user or body
 */
function identifyTool(user: string, body: string): string {
  const lowerUser = user.toLowerCase();
  const lowerBody = body.toLowerCase();
  
  if (lowerUser.includes('coderabbit') || lowerBody.includes('coderabbit')) return 'CodeRabbit';
  if (lowerUser.includes('sourcery') || lowerBody.includes('sourcery')) return 'Sourcery';
  if (lowerUser.includes('sonar') || lowerBody.includes('sonarcloud')) return 'SonarCloud';
  if (lowerUser.includes('snyk') || lowerBody.includes('snyk')) return 'Snyk';
  if (lowerUser.includes('sentry') || lowerBody.includes('sentry')) return 'Sentry';
  
  return 'Unknown';
}

/**
 * Fetch PR comments (issue comments + review comments)
 */
async function fetchPRComments(prNumber: number): Promise<ReviewComment[]> {
  const comments: ReviewComment[] = [];
  
  // Fetch issue comments (general PR comments)
  const issueComments = await octokit.issues.listComments({
    owner: GITHUB_OWNER,
    repo: GITHUB_REPO,
    issue_number: prNumber,
  });
  
  for (const comment of issueComments.data) {
    comments.push({
      id: comment.id,
      user: comment.user?.login || 'unknown',
      body: comment.body || '',
      created_at: comment.created_at,
    });
  }
  
  // Fetch review comments (inline code comments)
  const reviewComments = await octokit.pulls.listReviewComments({
    owner: GITHUB_OWNER,
    repo: GITHUB_REPO,
    pull_number: prNumber,
  });
  
  for (const comment of reviewComments.data) {
    comments.push({
      id: comment.id,
      user: comment.user?.login || 'unknown',
      body: comment.body || '',
      created_at: comment.created_at,
      path: comment.path,
      line: comment.line || undefined,
    });
  }
  
  return comments;
}

/**
 * Classify comments into issues
 */
function classifyComments(comments: ReviewComment[]): ClassifiedIssue[] {
  const issues: ClassifiedIssue[] = [];
  
  for (const comment of comments) {
    const tool = identifyTool(comment.user, comment.body);
    
    // Skip non-tool comments (human reviewers)
    if (tool === 'Unknown') continue;
    
    const severity = classifySeverity(comment.body);
    
    issues.push({
      severity,
      tool,
      message: comment.body,
      file: comment.path,
      line: comment.line,
    });
  }
  
  return issues;
}

/**
 * Generate markdown report
 */
function generateReport(prNumber: number, issues: ClassifiedIssue[]): string {
  const critical = issues.filter(i => i.severity === 'CRITICAL');
  const high = issues.filter(i => i.severity === 'HIGH');
  const medium = issues.filter(i => i.severity === 'MEDIUM');
  const low = issues.filter(i => i.severity === 'LOW');
  
  const report = `# PR #${prNumber} Review Analysis

**Generated**: ${new Date().toISOString()}  
**Total Issues**: ${issues.length}  
**Breakdown**: ${critical.length} CRITICAL, ${high.length} HIGH, ${medium.length} MEDIUM, ${low.length} LOW

---

## Summary

| Severity | Count | Action Required |
|----------|-------|-----------------|
| CRITICAL | ${critical.length} | Fix immediately before merge |
| HIGH | ${high.length} | Fix if <5 min each |
| MEDIUM | ${medium.length} | Document for later |
| LOW | ${low.length} | Optional (style/formatting) |

---

## CRITICAL Issues (${critical.length})

${critical.length === 0 ? '_No critical issues found._' : critical.map((issue, idx) => `
### ${idx + 1}. ${issue.tool}${issue.file ? ` - ${issue.file}:${issue.line}` : ''}

\`\`\`
${issue.message}
\`\`\`
`).join('\n')}

---

## HIGH Issues (${high.length})

${high.length === 0 ? '_No high-priority issues found._' : high.map((issue, idx) => `
### ${idx + 1}. ${issue.tool}${issue.file ? ` - ${issue.file}:${issue.line}` : ''}

\`\`\`
${issue.message}
\`\`\`
`).join('\n')}

---

## MEDIUM Issues (${medium.length})

${medium.length === 0 ? '_No medium-priority issues found._' : medium.map((issue, idx) => `
### ${idx + 1}. ${issue.tool}${issue.file ? ` - ${issue.file}:${issue.line}` : ''}

\`\`\`
${issue.message}
\`\`\`
`).join('\n')}

---

## LOW Issues (${low.length})

${low.length === 0 ? '_No low-priority issues found._' : low.map((issue, idx) => `
### ${idx + 1}. ${issue.tool}${issue.file ? ` - ${issue.file}:${issue.line}` : ''}

\`\`\`
${issue.message}
\`\`\`
`).join('\n')}

---

## Next Steps

1. **Fix CRITICAL issues** (${critical.length} found) - Block merge until resolved
2. **Fix HIGH issues** (${high.length} found) - Fix if <5 min each, otherwise document
3. **Document MEDIUM/LOW** (${medium.length + low.length} found) - Create follow-up issues

**Generated by**: \`pnpm run pr:scrape ${prNumber}\`
`;
  
  return report;
}

/**
 * Main execution
 */
async function main() {
  const prNumber = parseInt(process.argv[2], 10);
  
  if (!prNumber || isNaN(prNumber)) {
    console.error('❌ Usage: pnpm run pr:scrape <PR_NUMBER>');
    process.exit(1);
  }
  
  console.log(`🔍 Fetching PR #${prNumber} comments...`);
  const comments = await fetchPRComments(prNumber);
  console.log(`✅ Found ${comments.length} total comments`);
  
  console.log(`🔍 Classifying issues...`);
  const issues = classifyComments(comments);
  console.log(`✅ Classified ${issues.length} issues from automated tools`);
  
  console.log(`📝 Generating report...`);
  const report = generateReport(prNumber, issues);
  
  const outputPath = path.join(process.cwd(), 'docs', `PR_${prNumber}_REVIEW_ANALYSIS.md`);
  fs.writeFileSync(outputPath, report, 'utf-8');
  console.log(`✅ Report saved to: ${outputPath}`);
  
  // Print summary
  const critical = issues.filter(i => i.severity === 'CRITICAL').length;
  const high = issues.filter(i => i.severity === 'HIGH').length;
  
  if (critical > 0) {
    console.log(`\n⚠️  ${critical} CRITICAL issues found - Fix before merge!`);
  }
  if (high > 0) {
    console.log(`⚠️  ${high} HIGH issues found - Review recommended`);
  }
  if (critical === 0 && high === 0) {
    console.log(`\n✅ No critical or high-priority issues found`);
  }
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
