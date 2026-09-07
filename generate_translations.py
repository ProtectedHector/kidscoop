#!/usr/bin/env python3
import csv
import io

# Languages to translate to (excluding English which we already have)
languages = ['es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar', 'hi', 'ru']

# Read English articles
with open('new_articles_all_languages.csv', 'r', encoding='utf-8') as f:
    content = f.read()

reader = csv.DictReader(io.StringIO(content))
english_articles = [row for row in reader if row['language'] == 'en']

print(f"Found {len(english_articles)} English articles")
print(f"Will generate translations for {len(languages)} languages")
print(f"Total rows to generate: {len(english_articles) * len(languages)} translation rows")

# Start content ID from 23 (after the 10 English articles which end at 22)
content_id = 23

# Prepare output - we'll use csv.writer for proper escaping
output_rows = []

# First, add all English articles (already in file)
for art in english_articles:
    output_rows.append([
        art['id'],
        art['article_id'],
        art['language'],
        art['title'],
        art['content_text'],
        art['published_date'],
        art['published'],
        art.get('lyrics', '')
    ])

# Add translations - using English as placeholder (user will replace with actual translations)
for lang in languages:
    for art in english_articles:
        title_placeholder = f"[{lang.upper()}] {art['title']}"
        content_placeholder = f"[Translation needed for {lang}] {art['content_text'][:200]}..."
        output_rows.append([
            str(content_id),
            art['article_id'],
            lang,
            title_placeholder,
            content_placeholder,
            art['published_date'],
            art['published'],
            ''
        ])
        content_id += 1

# Write to new file using csv.writer for proper escaping
with open('new_articles_all_languages_complete.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f, quoting=csv.QUOTE_ALL)
    writer.writerow(['id', 'article_id', 'language', 'title', 'content_text', 'published_date', 'published', 'lyrics'])
    writer.writerows(output_rows)

print(f'\nCreated file with {len(output_rows)} content rows')
print(f'Content IDs: 13-22 (English), 23-{content_id-1} (translations)')
print('Note: Translations are placeholders - replace with actual translations')
