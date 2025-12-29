from playwright.sync_api import sync_playwright
import re

print("Launching browser...")
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    print("Loading Mercedes page...")
    page.goto('https://www.mercedes-benz.com.eg/en/passengercars/buy/brochure-downloads.html', 
              wait_until='networkidle', timeout=60000)
    
    print("Waiting for content...")
    page.wait_for_timeout(3000)  # Wait 3s for JS to render
    
    # Get full HTML after JS execution
    html = page.content()
    
    # Find all PDF links (multiple patterns)
    pdf_links = []
    
    # Pattern 1: Direct href with .pdf
    for link in re.findall(r'href="([^"]*\.pdf[^"]*)"', html):
        pdf_links.append(link)
    
    # Pattern 2: data-download attribute
    for link in re.findall(r'data-download="([^"]*)"', html):
        if '.pdf' in link.lower():
            pdf_links.append(link)
    
    # Pattern 3: Look for brochure/catalog URLs
    for link in re.findall(r'href="([^"]*(?:brochure|catalog|download)[^"]*\.pdf[^"]*)"', html, re.IGNORECASE):
        pdf_links.append(link)
    
    # Remove duplicates and fix relative URLs
    unique_links = []
    for link in set(pdf_links):
        if link.startswith('http'):
            unique_links.append(link)
        elif link.startswith('/'):
            unique_links.append(f'https://www.mercedes-benz.com.eg{link}')
        else:
            unique_links.append(f'https://www.mercedes-benz.com.eg/{link}')
    
    browser.close()
    
    if unique_links:
        print(f"\n=== Found {len(unique_links)} PDF URLs ===")
        for url in sorted(unique_links):
            print(url)
    else:
        print("\n⚠️  No PDF links found. Saving HTML for manual inspection...")
        with open('rendered_page.html', 'w', encoding='utf-8') as f:
            f.write(html)
        print("Saved to: rendered_page.html")
        print("\nSearching for any download buttons or model names...")
        # Try to find model links even if not direct PDFs
        model_links = re.findall(r'href="([^"]*(?:a-class|c-class|e-class|s-class|glc|gle|gls|eqa|eqb)[^"]*)"', html, re.IGNORECASE)
        if model_links:
            print("\nFound model pages:")
            for link in set(model_links[:10]):
                print(link)
