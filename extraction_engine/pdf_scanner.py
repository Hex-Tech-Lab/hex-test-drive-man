#!/usr/bin/env python3
import pdfplumber
import json
import glob
from pathlib import Path
from collections import Counter

def assess_pdf_complexity(pdf_path):
    """Rank PDFs by extraction confidence (0-100)"""
    
    score = {
        'path': str(pdf_path),
        'confidence': 100,
        'complexity': 'SIMPLE',
        'tables': 0,
        'pages_with_tables': 0,
        'total_rows': 0,
        'avg_rows_per_table': 0,
        'orientation': 'portrait',
        'has_bilingual': False,
        'headers_detected': 0,
        'risk_factors': []
    }
    
    try:
        with pdfplumber.open(pdf_path) as pdf:
            total_tables = 0
            total_rows = 0
            pages_with_tables = 0
            
            for page in pdf.pages:
                tables = page.extract_tables()
                if tables:
                    pages_with_tables += 1
                    total_tables += len(tables)
                    for table in tables:
                        total_rows += len(table) - 1  # Skip headers
                
                # Check orientation
                if page.width > page.height * 1.2:
                    score['orientation'] = 'landscape'
            
            score['tables'] = total_tables
            score['pages_with_tables'] = pages_with_tables
            score['total_rows'] = total_rows
            
            if total_tables > 0:
                score['avg_rows_per_table'] = total_rows / total_tables
            
            # Bilingual detection (Arabic text)
            text = page.extract_text()
            if any('\u0600' <= char <= '\u06FF' for char in text or ''):
                score['has_bilingual'] = True
            
            # Complexity scoring
            if total_tables == 0:
                score['confidence'] = 0
                score['complexity'] = 'NO_TABLES'
                score['risk_factors'].append('No tables found')
            
            elif total_tables > 4 or total_rows > 200:
                score['confidence'] -= 25
                score['complexity'] = 'COMPLEX'
                score['risk_factors'].append('Too many tables/rows')
            
            elif score['orientation'] == 'landscape':
                score['confidence'] -= 10
                score['risk_factors'].append('Landscape layout')
            
            elif score['has_bilingual']:
                score['confidence'] -= 5
                score['risk_factors'].append('Bilingual content')
            
            score['confidence'] = max(0, score['confidence'])
    
    except Exception as e:
        score['confidence'] = 0
        score['risk_factors'].append(f'Parse error: {str(e)}')
    
    return score

def scan_batch(pdf_folder='*.pdf'):
    """Scan all PDFs and rank by confidence"""
    
    pdf_files = glob.glob(pdf_folder)
    assessments = []
    
    print("🔍 PDF ASSESSMENT SCANNER")
    print("=" * 60)
    
    for pdf_path in pdf_files:
        score = assess_pdf_complexity(pdf_path)
        assessments.append(score)
        
        complexity_map = {
            range(90, 101): '🟢 SIMPLE (Production Ready)',
            range(70, 90): '🟡 MEDIUM (Test Data)', 
            range(50, 70): '🟠 COMPLEX (Manual Review)',
            range(0, 50): '🔴 UNSUITABLE'
        }
        
        label = '❓ UNKNOWN'
        for score_range, label_text in complexity_map.items():
            if score['confidence'] in score_range:
                label = label_text
                break
        
        print(f"{label} {score['confidence']:3d}% {Path(pdf_path).name}")
        print(f"   Tables: {score['tables']} | Rows: {score['total_rows']} | {score['orientation']}")
    
    # Sort by confidence (highest first)
    assessments.sort(key=lambda x: x['confidence'], reverse=True)
    
    # Save ranked list
    with open('pdf_confidence_ranking.json', 'w') as f:
        json.dump(assessments, f, indent=2)
    
    print("\n🏆 TOP 40 PRIORITIZED PDFs:")
    print("-" * 60)
    for i, assessment in enumerate(assessments[:40], 1):
        print(f"{i:2d}. {Path(assessment['path']).name} ({assessment['confidence']}% confidence)")
    
    return assessments

# Execute scan
if __name__ == "__main__":
    rankings = scan_batch('*.pdf')
    print(f"\n✅ Full ranking saved: pdf_confidence_ranking.json")
