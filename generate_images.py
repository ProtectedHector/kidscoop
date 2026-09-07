#!/usr/bin/env python3
"""
Generate images for articles using OpenAI DALL-E API
Creates both colored ({article_id}.png) and black & white ({article_id}c.png) versions

Requirements:
- pip install openai pillow requests
- Set OPENAI_API_KEY environment variable

Usage:
    python3 generate_images.py --article-id 1 --title "Penguin Post Office" --content "Story about penguins..."
    python3 generate_images.py --article-ids "1,2,3,5"  # Generate for specific article IDs from CSV
    python3 generate_images.py --all  # Generate for all articles from CSV
"""

import argparse
import os
import sys
import csv
import io
import requests
from openai import OpenAI
from PIL import Image
import io as io_module

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
            article_id = int(row.get('article_id', 0))
            if article_id > 0 and article_id not in articles:
                articles[article_id] = {
                    'id': article_id,
                    'title': row.get('title', ''),
                    'content': row.get('content_text', ''),
                }
    
    return articles

def main():
    parser = argparse.ArgumentParser(description='Generate images for articles')
    parser.add_argument('--article-id', type=int, help='Article ID to generate images for (single)')
    parser.add_argument('--article-ids', type=str, help='Article IDs separated by commas (e.g., "1,2,3")')
    parser.add_argument('--title', type=str, help='Article title (required when using --article-id)')
    parser.add_argument('--content', type=str, help='Article content (required when using --article-id)')
    parser.add_argument('--all', action='store_true', help='Generate for all articles from CSV')
    parser.add_argument('--csv', type=str, default='new_articles_all_languages.csv', help='CSV file with articles')
    parser.add_argument('--output-dir', type=str, default='public/articles', help='Output directory')
    
    args = parser.parse_args()
    
    # Check API key
    if not os.getenv('OPENAI_API_KEY'):
        print("❌ Error: OPENAI_API_KEY environment variable not set")
        print("   Set it with: export OPENAI_API_KEY='your-api-key'")
        sys.exit(1)
    
    import time
    
    if args.all:
        # Read articles from CSV
        articles = load_articles_from_csv(args.csv)
        
        if not articles:
            print(f"❌ Error: No articles found in CSV file: {args.csv}")
            sys.exit(1)
        
        print(f"📚 Found {len(articles)} articles to process")
        
        for article_id, article in sorted(articles.items()):
            generate_for_article(
                article['id'],
                article['title'],
                article['content'],
                args.output_dir
            )
            # Small delay to avoid rate limits
            time.sleep(2)
    
    elif args.article_ids:
        # Parse comma-separated article IDs
        try:
            article_id_list = [int(id.strip()) for id in args.article_ids.split(',') if id.strip()]
        except ValueError:
            print("❌ Error: Invalid article IDs format. Use comma-separated numbers (e.g., '1,2,3')")
            sys.exit(1)
        
        if not article_id_list:
            print("❌ Error: No valid article IDs provided")
            sys.exit(1)
        
        # Load articles from CSV
        articles = load_articles_from_csv(args.csv)
        
        if not articles:
            print(f"❌ Error: No articles found in CSV file: {args.csv}")
            sys.exit(1)
        
        print(f"📚 Generating images for {len(article_id_list)} article(s): {', '.join(map(str, article_id_list))}")
        
        for article_id in article_id_list:
            if article_id in articles:
                article = articles[article_id]
                generate_for_article(
                    article['id'],
                    article['title'],
                    article['content'],
                    args.output_dir
                )
                # Small delay to avoid rate limits
                time.sleep(2)
            else:
                print(f"⚠️  Warning: Article ID {article_id} not found in CSV, skipping...")
    
    elif args.article_id and args.title:
        generate_for_article(
            args.article_id,
            args.title,
            args.content or "",
            args.output_dir
        )
    else:
        parser.print_help()
        sys.exit(1)

if __name__ == '__main__':
    main()
