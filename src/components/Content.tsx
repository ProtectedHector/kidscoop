// pages/content/[id].tsx
import { useRouter } from 'next/router';

interface Article {
  id: number;
  title: string;
  content_text: string;
  image_path: string;
  published_date: string;
}

interface ContentProps {
  article: Article;
}

const Content: React.FC<ContentProps> = ({ article }) => {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{article.title}</h1>
      <img src={article.image_path} alt={article.title} />
      <p>{article.content_text}</p>
    </div>
  );
}

export async function getStaticPaths() {
  const res = await fetch('http://localhost:3000/api/articles');
  const articles = await res.json();

  const paths = articles.map((article: { id: { toString: () => any; }; }) => ({
    params: { id: article.id.toString() },
  }));

  return { paths, fallback: true };
}

// @ts-ignore
export async function getStaticProps({ params }) {
  const res = await fetch(`http://localhost:3000/api/articles/${params.id}`);
  const article = await res.json();

  return { props: { article }, revalidate: 1 };
}

export default Content;
