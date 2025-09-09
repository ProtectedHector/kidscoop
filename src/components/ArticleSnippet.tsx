// components/ArticleSnippet.tsx
import Link from 'next/link';

interface Article {
  id: number;
  title: string;
  content_text: string;
  image_path: string;
}

interface ArticleSnippetProps {
  article: Article;
}

const ArticleSnippet: React.FC<ArticleSnippetProps> = ({ article }) => {
  return (
    <Link href={`/content/${article.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer group">
        <div className="aspect-w-16 aspect-h-9">
          <img 
            src={article.image_path} 
            alt={article.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors duration-300">
            {article.title}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {article.content_text.substring(0, 120)}...
          </p>
          <div className="mt-4 text-blue-600 font-medium group-hover:text-blue-700">
            Read more →
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ArticleSnippet;