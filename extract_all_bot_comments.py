import json
import subprocess
import re
import os

def run_gh_api(endpoint):
    # Uses gh CLI which handles auth automatically
    cmd = ["gh", "api", endpoint, "--paginate"]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error fetching {endpoint}: {result.stderr}")
        return []
    return json.loads(result.stdout)

def fetch_all_comments():
    print("Fetching review comments (inline code comments)...")
    review_comments = run_gh_api("/repos/Hex-Tech-Lab/hex-test-drive-man/pulls/7/comments")
    print("Fetching issue comments (general PR comments)...")
    issue_comments = run_gh_api("/repos/Hex-Tech-Lab/hex-test-drive-man/issues/7/comments")
    
    # Normalize fields (review comments have 'path', 'line'. Issue comments don't always for inline)
    for c in issue_comments:
        c['type'] = 'issue_comment'
        # Issue comments don't have path/line inherently, set defaults for consistency
        c['path'] = 'General/Issue Comment' 
        c['line'] = 'N/A'
    for c in review_comments:
        c['type'] = 'review_comment'
        
    all_comments = review_comments + issue_comments
    # Sort by created_at
    all_comments.sort(key=lambda x: x.get('created_at', ''))
    return all_comments

def extract_prompts(body):
    prompts = []
    # Looser regex (reverted to this)
    pattern = r"<details>\s*<summary>.*?Prompt for AI Agents.*? </summary>(.*?)</details>"
    matches = re.finditer(pattern, body, re.DOTALL | re.IGNORECASE)
    for m in matches:
        prompts.append(m.group(1).strip())
    return prompts

def extract_severity(body):
    # Regex to capture severity from patterns like "_⚠️ Potential issue_ | _🟠 Major_"
    # More robust regex to handle various badges/emojis and text
    match = re.search(r'(_.*?_ | _.*?)?\s*(Major|Minor|Nitpick|Potential issue|Trivial)', body, re.IGNORECASE)
    if match:
        sev = match.group(2).lower()
        if "major" in sev or "potential issue" in sev:
            return "Major"
        elif "minor" in sev or "nitpick" in sev or "trivial" in sev:
            return "Minor"
        return sev.capitalize()
    
    if "parsing error" in body.lower(): return "Critical"
    return "Info"

def main():
    comments = fetch_all_comments()
    
    by_tool = {
        "CodeRabbit": [],
        "Sourcery": [],
        "Sentry": [],
        "Manual": []
    }
    
    for c in comments:
        login = c['user']['login']
        if 'coderabbitai' in login:
            tool = "CodeRabbit"
        elif 'sourcery' in login:
            tool = "Sourcery"
        elif 'sentry' in login:
            tool = "Sentry"
        else:
            tool = "Manual"
            
        by_tool[tool].append(c)
        
    output = "# Comprehensive PR #7 Comment Analysis\n\n"
    
    total_comments_count = len(comments)
    output += f"**Total Comments:** {total_comments_count}\n"
    for tool, items in by_tool.items():
        output += f"- **{tool}:** {len(items)}\n"
    output += "\n---\n\n"
    
    # Process CodeRabbit
    output += "## CodeRabbit Fix List\n\n"
    
    cr_comments = by_tool["CodeRabbit"]
    
    actionable_cr = [] # Comments with Prompts or critical parsing errors
    for c in cr_comments:
        prompts = extract_prompts(c.get('body', ''))
        if prompts:
            actionable_cr.append(c)
        elif "parsing error" in c.get('body', '').lower():
            actionable_cr.append(c) # Also treat parsing errors as actionable
            
    if not actionable_cr:
        output += "*No actionable CodeRabbit prompts found (yet).*\n\n"
    
    for c in actionable_cr:
        body = c.get('body', '')
        file_path = c.get('path', 'General')
        line = c.get('line', 'N/A')
        url = c.get('html_url', '')
        severity = extract_severity(body)
        prompts = extract_prompts(body) # Re-extract to print
        
        output += f"### [{severity}] File: `{file_path}` (Line {line})\n"
        output += f"**Link:** [View]({url})\n\n"
        
        # Visible text (approximate)
        visible_text_start = body.split('<details>')[0].strip()
        output += f"**Context:** {visible_text_start}\n\n"
        
        if prompts:
            for i, p in enumerate(prompts):
                output += f"**AI Prompt {i+1}:**\n```text\n{p}\n```\n\n"
        else:
            output += "**Note:** This comment indicates a parsing error or other critical issue without a direct AI prompt.\n\n"
            
        output += "**Estimated Fix Time:** 5m\n" # Default estimate
        output += "---\n\n"

    # Process Others
    output += "## Other Tools & Manual Reviews\n\n"
    for tool in ["Sourcery", "Sentry", "Manual"]:
        if by_tool[tool]:
            output += f"### {tool}\n"
            for c in by_tool[tool]:
                login = c['user']['login']
                body_preview = c['body'][:200].replace('\n', ' ')
                url = c['html_url']
                output += f"- **{login}**: {body_preview}... [Link]({url})\n"
            output += "\n"

    # Ensure docs dir exists
    os.makedirs("docs", exist_ok=True)
    
    with open("docs/PR7_CODERABBIT_AI_PROMPTS.md", "w") as f:
        f.write(output)
        
    print(f"Processed {total_comments_count} comments.")
    print(f"CodeRabbit Actionable (with prompts or critical errors): {len(actionable_cr)}")
    for tool, items in by_tool.items():
        print(f"{tool}: {len(items)}")

if __name__ == "__main__":
    main()