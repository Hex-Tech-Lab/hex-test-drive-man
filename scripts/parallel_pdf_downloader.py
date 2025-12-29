
import json
import os
import time
import concurrent.futures
from pathlib import Path
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(threadName)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("pdf_download_agent.log"),
        logging.StreamHandler()
    ]
)

ROSTER_FILE = "docs/2025-12-30-GC-comprehensive-pdf-roster.json"
BASE_DIR = "pdfs_comprehensive"

def load_roster():
    with open(ROSTER_FILE, 'r') as f:
        return json.load(f)

def save_roster(data):
    with open(ROSTER_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def verify_file(path):
    p = Path(path)
    if p.exists() and p.stat().st_size > 1000: # Arbitrary 1KB limit for valid PDF
        return True, p.stat().st_size
    return False, 0

def process_agent_task(agent_id, agent_data):
    logging.info(f"Agent {agent_id} starting task: {agent_data['name']}")
    
    brands = agent_data['brands']
    results = []
    
    for brand in brands:
        # Create directory
        brand_dir = Path(BASE_DIR) / brand
        brand_dir.mkdir(parents=True, exist_ok=True)
        
        # Check existing files
        existing_pdfs = list(brand_dir.glob("*.pdf"))
        
        brand_status = {
            "brand": brand,
            "directory": str(brand_dir),
            "files_found": [f.name for f in existing_pdfs],
            "count": len(existing_pdfs),
            "status": "partial" if len(existing_pdfs) > 0 else "missing"
        }
        
        # Verification Agent Logic
        for pdf in existing_pdfs:
            valid, size = verify_file(pdf)
            if not valid:
                logging.warning(f"Corrupt file found: {pdf}")
                brand_status["issues"] = brand_status.get("issues", []) + [str(pdf)]
        
        results.append(brand_status)
        logging.info(f"Agent {agent_id} verified {brand}: {len(existing_pdfs)} PDFs found.")
        
    return agent_id, results

def main():
    roster = load_roster()
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = []
        for agent_id, agent_data in roster['agents'].items():
            futures.append(executor.submit(process_agent_task, agent_id, agent_data))
            
        for future in concurrent.futures.as_completed(futures):
            agent_id, results = future.result()
            roster['agents'][agent_id]['models'] = results
            roster['agents'][agent_id]['status'] = "audited"
            
            # Documentation Agent Update
            save_roster(roster)
            logging.info(f"Documentation Agent updated roster for {agent_id}")

    # Generate Markdown Report
    generate_markdown_report(roster)

def generate_markdown_report(roster):
    report = "# PDF Download Status Report\n\n"
    report += f"**Date**: {time.strftime('%Y-%m-%d %H:%M')}\n"
    report += "**Status**: Audit Complete, Downloads Pending\n\n"
    
    for agent_id, data in roster['agents'].items():
        report += f"## {agent_id}: {data['name']}\n"
        for brand_data in data.get('models', []):
            report += f"- **{brand_data['brand']}**: {brand_data['count']} PDFs found\n"
            if brand_data['count'] == 0:
                report += f"  - ⚠️ MISSING\n"
            else:
                for f in brand_data['files_found']:
                    report += f"  - ✅ {f}\n"
        report += "\n"
        
    with open("docs/2025-12-30-GC-download-report.md", "w") as f:
        f.write(report)
    logging.info("Report generated: docs/2025-12-30-GC-download-report.md")

if __name__ == "__main__":
    main()
