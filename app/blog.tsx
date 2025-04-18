'use client';

import { useEffect, useState } from 'react';
import { GraphQLClient, gql } from 'graphql-request';
import Link from 'next/link';

const QUERY = gql`
  query WKM {
    posts {
      id
      title
      slug
      content {
        html
      }
      coverPhoto {
        url
      }
      publishedAt
    }
  }
`;

interface Post {
  id: string;
  title: string;
  slug: string;
  publishedAt: string;
  content: {
    html: string;
  };
  coverPhoto: {
    url: string;
  };
}

export default function Blog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!process.env.NEXT_PUBLIC_HYGRAPH_ENDPOINT) {
        setError('GraphQL endpoint is not configured');
        setLoading(false);
        return;
      }

      const client = new GraphQLClient(process.env.NEXT_PUBLIC_HYGRAPH_ENDPOINT);
      try {
        const data = await client.request<{ posts: Post[] }>(QUERY);
        setPosts(data.posts);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Something went wrong while fetching posts.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <p className="text-center text-gray-600 py-8">Loading posts...</p>;
  if (error) return <p className="text-center text-red-500 py-8">{error}</p>;
  if (!posts.length) return <p className="text-center text-gray-500 py-8">No posts found</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <article 
            key={post.id} 
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
          >
            {post.coverPhoto?.url && (
              <div className="h-48 overflow-hidden">
                <img
                  src={post.coverPhoto.url}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-6 flex-grow">
              <h2 className="text-xl font-semibold mb-2 line-clamp-2">
                <Link href={`/posts/${post.slug}`} className="hover:underline">
                  {post.title}
                </Link>
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Published on {new Date(post.publishedAt).toLocaleDateString()}
              </p>
              <div
                className="prose prose-sm text-gray-600 mb-4 line-clamp-3"
                dangerouslySetInnerHTML={{ __html: post.content.html }}
              />
            </div>
            <div className="px-6 pb-6">
              <Link
                href={`/posts/${post.slug}`}
                className="text-blue-600 font-medium hover:underline inline-flex items-center"
              >
                Read more
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
