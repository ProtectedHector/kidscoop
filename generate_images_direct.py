#!/usr/bin/env python3
"""
Direct script to generate images for articles 2-11
This script runs the image generation logic directly without command-line arguments
"""

import os
import sys
import csv
import io
import time
import requests
from openai import OpenAI

# Check API key
if not os.getenv('OPENAI_API_KEY'):
    print("❌ Error: OPENAI_API_KEY environment variable not set")
    print("   Set it with: export OPENAI_API_KEY='your-api-key'")
    sys.exit(1)

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def generate_image(prompt: str, style: str = "colorful") -> bytes:
    """Generate image using DALL-E 3"""
    try:
        # Modify prompt based on style
        if style == "coloring":
            prompt = f"{prompt}. Black and white line art, simple outlines, suitable for coloring, no shading, high contrast"
        else:
            prompt = f"{prompt}. Colorful, vibrant, kid-friendly illustration, cartoon style"
        
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",
            quality="standard",
            n=1,
        )
        
        image_url = response.data[0].url
        # Download image
        img_response = requests.get(image_url)
        return img_response.content
    except Exception as e:
        print(f"Error generating image: {e}")
        return None

def save_image(image_data: bytes, filepath: str):
    """Save image to file"""
    try:
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, 'wb') as f:
            f.write(image_data)
        print(f"✅ Saved: {filepath}")
    except Exception as e:
        print(f"❌ Error saving {filepath}: {e}")

def generate_for_article(article_id: int, title: str, content: str, output_dir: str = "public/articles"):
    """Generate both colored and coloring page images for an article"""
    # Create prompt from title and first paragraph
    first_paragraph = content.split('\n\n')[0] if content else ""
    prompt = f"Children's story illustration: {title}. {first_paragraph[:200]}"
    
    print(f"\n📝 Generating images for Article {article_id}: {title}")
    
    # Generate colored image
    print("🎨 Generating colored image...")
    colored_image = generate_image(prompt, "colorful")
    if colored_image:
        save_image(colored_image, os.path.join(output_dir, f"{article_id}.png"))
    
    # Generate coloring page (black & white)
    print("✏️  Generating coloring page...")
    coloring_image = generate_image(prompt, "coloring")
    if coloring_image:
        save_image(coloring_image, os.path.join(output_dir, f"{article_id}c.png"))

def load_articles_from_csv(csv_file: str):
    """Load English articles from CSV file"""
    if not os.path.exists(csv_file):
        print(f"❌ Error: CSV file not found: {csv_file}")
        return {}
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    reader = csv.DictReader(io.StringIO(content))
    articles = {}
    
    # Get English articles only
    for row in reader:
        if row.get('language', '').lower() == 'en':
            try:
                article_id = int(row.get('article_id', 0))
                if article_id > 0 and article_id not in articles:
                    articles[article_id] = {
                        'id': article_id,
                        'title': row.get('title', ''),
                        'content': row.get('content_text', ''),
                    }
            except ValueError:
                continue
    
    return articles

# Main execution
if __name__ == '__main__':
    # Article IDs to generate
    article_ids = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    
    # CSV file to read from
    csv_file = 'new_articles_complete_6_languages.csv'
    
    print(f"📚 Loading articles from {csv_file}...")
    articles = load_articles_from_csv(csv_file)
    
    if not articles:
        print(f"❌ Error: No articles found in CSV file: {csv_file}")
        sys.exit(1)
    
    print(f"📚 Generating images for {len(article_ids)} article(s): {', '.join(map(str, article_ids))}")
    
    for article_id in article_ids:
        if article_id in articles:
            article = articles[article_id]
            generate_for_article(
                article['id'],
                article['title'],
                article['content'],
                'public/articles'
            )
            # Small delay to avoid rate limits
            time.sleep(2)
        else:
            print(f"⚠️  Warning: Article ID {article_id} not found in CSV, skipping...")
    
    print("\n✅ Image generation complete!")
