#!/usr/bin/env tsx
import { config } from "dotenv";
config({ path: ".env.local" });
/**
 * PR Review Scraper - Enhanced 5D Taxonomy
 * 
 * Fetches PR comments from automated review tools (CodeRabbit, Sourcery, Sonar, Snyk, Sentry)
 * and generates a classified analysis report with 5-dimensional taxonomy. 
 * 
 * Usage: pnpm run pr:scrape <PR_NUMBER>
 * Output: docs/PR_<NUMBER>_REVIEW_ANALYSIS.md
 */

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

interface EnhancedIssue {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  impactType: 'EXPLOIT_VECTOR' | 'CRASH_BUG' | 'DATA_LOSS' | 'PERF_DEGRADATION' | 'UX_BLOCKER' | 'TECH_DEBT';
  attackSurface: 'EXTERNAL_API' | 'INTERNAL_LOGIC' | 'UI_COMPONENT' | 'DATA_LAYER';
  blastRadius: 'GLOBAL' | 'MODULE' | 'COMPONENT' | 'ISOLATED';
  remediationEffort: 'TRIVIAL' | 'QUICK' | 'MODERATE' | 'COMPLEX';
  tool: string;
  message: string;
  file?: string;
  line?: number;
}

const IMPACT_TYPE_PATTERNS = {
  EXPLOIT_VECTOR: [
    /uncontrolled.*api/i, /rate limit/i, /dos|denial of service/i, /sql injection/i, /xss|cross-site/i, /csrf/i, /authentication bypass/i, 
    /security/i, /vulnerability/i, /auth/i, /credentials/i, /secret/i
  ],
  CRASH_BUG: [
    /memory leak/i, /null pointer|undefined/i, /race condition/i, /deadlock/i, /infinite loop/i, /stack overflow/i, /out of memory/i,
    /crash/i, /exception/i, /error handling/i, /unhandled/i
  ],
  DATA_LOSS: [
    /data loss/i, /corruption/i, /orphaned records/i, /missing cascade/i, /backup/i, /delete/i, /drop/i
  ],
  PERF_DEGRADATION: [
    /performance/i, /slow/i, /bottleneck/i, /blocking/i, /latency/i, /render/i, /rerender/i, /optimization/i
  ],
  UX_BLOCKER: [
    /accessibility/i, /a11y/i, /contrast/i, /broken layout/i, /responsive/i, /mobile/i, /usability/i
  ],
  TECH_DEBT: [
    /refactor/i, /cleanup/i, /deprecated/i, /legacy/i, /todo/i, /style/i, /format/i, /lint/i
  ]
};

function classifySeverity(body: string): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
  const lowerBody = body.toLowerCase();
  if ((lowerBody.includes('security') || lowerBody.includes('vulnerability') || lowerBody.includes('critical') || lowerBody.includes('data loss') || lowerBody.includes('breaking change')) && !lowerBody.includes('quality gate passed')) return 'CRITICAL';
  if (lowerBody.includes('performance') || lowerBody.includes('memory leak') || lowerBody.includes('type error') || lowerBody.includes('logic error') || lowerBody.includes('bug')) return 'HIGH';
  if (lowerBody.includes('refactor') || lowerBody.includes('complexity') || lowerBody.includes('duplication') || lowerBody.includes('maintainability')) return 'MEDIUM';
  return 'LOW';
}

function detectImpactType(body: string): EnhancedIssue['impactType'] {
  for (const [type, patterns] of Object.entries(IMPACT_TYPE_PATTERNS)) {
    if (patterns.some(p => p.test(body))) return type as EnhancedIssue['impactType'];
  }
  return 'TECH_DEBT';
}

function detectAttackSurface(file?: string): EnhancedIssue['attackSurface'] {
  if (!file) return 'INTERNAL_LOGIC';
  if (file.includes('api/') || file.includes('server/')) return 'EXTERNAL_API';
  if (file.includes('components/') || file.includes('app/') || file.includes('pages/')) return 'UI_COMPONENT';
  if (file.includes('store/') || file.includes('services/') || file.includes('lib/')) return 'INTERNAL_LOGIC';
  if (file.includes('db/') || file.includes('prisma/') || file.includes('supabase/')) return 'DATA_LAYER';
  return 'INTERNAL_LOGIC';
}

function analyzeBlastRadius(file?: string): EnhancedIssue['blastRadius'] {
  if (!file) return 'ISOLATED';
  if (file.includes('config') || file.includes('types/') || file.includes('utils/') || file.includes('lib/')) return 'MODULE';
  if (file.includes('layout.tsx') || file.includes('provider') || file.includes('context')) return 'GLOBAL';
  return 'COMPONENT';
}

function estimateEffort(body: string): EnhancedIssue['remediationEffort'] {
  const lower = body.toLowerCase();
  if (lower.includes('typo') || lower.includes('rename') || lower.includes('whitespace')) return 'TRIVIAL';
  if (lower.includes('quick fix') || lower.includes('simple') || lower.includes('one line')) return 'QUICK';
  if (lower.includes('architecture') || lower.includes('rewrite') || lower.includes('redesign')) return 'COMPLEX';
  return 'MODERATE';
}

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

async function fetchPRComments(prNumber: number): Promise<ReviewComment[]> {
  const comments: ReviewComment[] = [];
  const issueComments = await octokit.issues.listComments({ owner: GITHUB_OWNER, repo: GITHUB_REPO, issue_number: prNumber });
  for (const comment of issueComments.data) {
    comments.push({ id: comment.id, user: comment.user?.login || 'unknown', body: comment.body || '', created_at: comment.created_at });
  }
  const reviewComments = await octokit.pulls.listReviewComments({ owner: GITHUB_OWNER, repo: GITHUB_REPO, pull_number: prNumber });
  for (const comment of reviewComments.data) {
    comments.push({ id: comment.id, user: comment.user?.login || 'unknown', body: comment.body || '', created_at: comment.created_at, path: comment.path, line: comment.line || undefined });
  }
  return comments;
}

function classifyComments(comments: ReviewComment[]): EnhancedIssue[] {
  const issues: EnhancedIssue[] = [];
  for (const comment of comments) {
    const tool = identifyTool(comment.user, comment.body);
    if (tool === 'Unknown') continue;
    issues.push({
      severity: classifySeverity(comment.body),
      impactType: detectImpactType(comment.body),
      attackSurface: detectAttackSurface(comment.path),
      blastRadius: analyzeBlastRadius(comment.path),
      remediationEffort: estimateEffort(comment.body),
      tool,
      message: comment.body,
      file: comment.path,
      line: comment.line
    });
  }
  return issues;
}

function determineBucket(issues: EnhancedIssue[]): { bucket: string; reason: string[] } {
  const reasons: string[] = [];
  let bucket = 'BUCKET_1_MERGE';

  const criticals = issues.filter(i => i.severity === 'CRITICAL');
  const highs = issues.filter(i => i.severity === 'HIGH');
  const exploitVectors = issues.filter(i => i.impactType === 'EXPLOIT_VECTOR');
  const crashBugs = issues.filter(i => i.impactType === 'CRASH_BUG');
  const dataLoss = issues.filter(i => i.impactType === 'DATA_LOSS');
  const externalExploits = exploitVectors.filter(i => i.attackSurface === 'EXTERNAL_API');
  const complexCriticals = criticals.filter(i => i.remediationEffort === 'COMPLEX');

  if (criticals.length > 0) reasons.push(`${criticals.length} CRITICAL issues`);
  if (highs.length >= 4) reasons.push(`${highs.length} HIGH issues (limit 3)`);
  if (exploitVectors.length >= 2) reasons.push(`${exploitVectors.length} EXPLOIT_VECTORs`);
  if (externalExploits.length > 0) reasons.push('EXPLOIT_VECTOR on EXTERNAL_API');
  if (crashBugs.length >= 3) reasons.push(`${crashBugs.length} CRASH_BUGs`);
  if (dataLoss.length > 0) reasons.push('DATA_LOSS detected');
  if (complexCriticals.length > 0) reasons.push('COMPLEX remediation on CRITICAL issue');

  if (reasons.length > 0) {
    bucket = 'BUCKET_3_BLOCK';
  } else if (highs.length >= 1 || exploitVectors.length >= 1 || crashBugs.length >= 1) {
    bucket = 'BUCKET_2_FIX';
    reasons.push('Contains fixes required before merge (Bucket 2 criteria met)');
  } else {
    reasons.push('No blocking issues found');
  }

  return { bucket, reason: reasons };
}

function generateReport(prNumber: number, issues: EnhancedIssue[]): string {
  const { bucket, reason } = determineBucket(issues);
  
  const critical = issues.filter(i => i.severity === 'CRITICAL');
  const high = issues.filter(i => i.severity === 'HIGH');
  const medium = issues.filter(i => i.severity === 'MEDIUM');
  const low = issues.filter(i => i.severity === 'LOW');

  const exploit = issues.filter(i => i.impactType === 'EXPLOIT_VECTOR');
  const crash = issues.filter(i => i.impactType === 'CRASH_BUG');
  const perf = issues.filter(i => i.impactType === 'PERF_DEGRADATION');

  let report = `# PR #${prNumber} Review Analysis (Enhanced 5D)\n\n`;
  report += `**Generated**: ${new Date().toISOString()}\n`;
  report += `**Bucket**: **${bucket}**\n`;
  report += `**Reasons**:\n${reason.map(r => `- ${r}`).join('\n')}\n\n`;
  report += `---\n\n## Impact Type Analysis\n\n`;
  
  report += `### 🚨 Exploit Vectors (${exploit.length})\n`;
  report += exploit.length === 0 ? '_None_\n' : `| Severity | Tool | Attack Surface | Remediation |\n|---|---|---|---|
${exploit.map(i => `| ${i.severity} | ${i.tool} | ${i.attackSurface} | ${i.remediationEffort} |`).join('\n')}\n`;
  
  report += `\n### 💥 Crash Bugs (${crash.length})\n`;
  report += crash.length === 0 ? '_None_\n' : `| Severity | Tool | Blast Radius | Remediation |\n|---|---|---|---|
${crash.map(i => `| ${i.severity} | ${i.tool} | ${i.blastRadius} | ${i.remediationEffort} |`).join('\n')}\n`;
  
  report += `\n### 📊 Performance Degradation (${perf.length})\n`;
  report += perf.length === 0 ? '_None_\n' : `| Severity | Tool | Blast Radius | Remediation |\n|---|---|---|---|
${perf.map(i => `| ${i.severity} | ${i.tool} | ${i.blastRadius} | ${i.remediationEffort} |`).join('\n')}\n`;
  
  report += `\n---\n\n## Detailed Issues\n\n`;
  
  report += `### CRITICAL (${critical.length})\n`;
  report += critical.map((i, idx) => `#### ${idx+1}. ${i.tool} (${i.impactType})\nFile: \
${i.file || 'N/A'}:${i.line || '?'}\
> ${i.message.substring(0, 200)}...`).join('\n\n') + '\n\n';
  
  report += `### HIGH (${high.length})\n`;
  report += high.map((i, idx) => `#### ${idx+1}. ${i.tool} (${i.impactType})\nFile: \n${i.file || 'N/A'}:${i.line || '?'} \n> ${i.message.substring(0, 200)}...`).join('\n\n') + '\n\n';
  
  report += `### MEDIUM (${medium.length})\n`;
  report += medium.map((i, idx) => `#### ${idx+1}. ${i.tool} (${i.impactType})\nFile: \n${i.file || 'N/A'}:${i.line || '?'} \n> ${i.message.substring(0, 200)}...`).join('\n\n') + '\n\n';
  
  report += `### LOW (${low.length})\n`;
  report += low.map((i, idx) => `#### ${idx+1}. ${i.tool} (${i.impactType})\nFile: \n${i.file || 'N/A'}:${i.line || '?'} \n> ${i.message.substring(0, 200)}...`).join('\n\n');
  
  report += `\n\n**Generated by**: 
${'`pnpm run pr:scrape ${prNumber}`'}\n`;
  
  return report;
}

async function main() {
  const prNumber = parseInt(process.argv[2], 10);
  if (!prNumber || isNaN(prNumber)) { console.error('❌ Usage: pnpm run pr:scrape <PR_NUMBER>'); process.exit(1); }
  
  console.log(`🔍 Fetching PR #${prNumber} comments...`);
  const comments = await fetchPRComments(prNumber);
  console.log(`✅ Found ${comments.length} total comments`);
  
  console.log(`🔍 Classifying issues (5D Taxonomy)...`);
  const issues = classifyComments(comments);
  console.log(`✅ Classified ${issues.length} issues`);
  
  const report = generateReport(prNumber, issues);
  const outputPath = path.join(process.cwd(), 'docs', `PR_${prNumber}_REVIEW_ANALYSIS.md`);
  fs.writeFileSync(outputPath, report, 'utf-8');
  console.log(`✅ Report saved to: ${outputPath}`);
  
  const { bucket } = determineBucket(issues);
  console.log(`\n🪣 Classification: ${bucket}`);
}

main().catch(error => { console.error('❌ Error:', error.message); process.exit(1); });
