// app/posts/[slug]/page.tsx
import { GraphQLClient, gql } from 'graphql-request';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';

const client = new GraphQLClient(process.env.NEXT_PUBLIC_HYGRAPH_ENDPOINT || '');

const GET_POST_BY_SLUG = gql`
  query GetPostBySlug($slug: String!) {
    post(where: { slug: $slug }) {
      title
      publishedAt
      content {
        html
      }
      coverPhoto {
        url
      }
    }
  }
`;

interface Post {
  title: string;
  publishedAt: string;
  content: {
    html: string;
  };
  coverPhoto?: {
    url: string;
  };
}

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  try {
    const data = await client.request<{ posts: { slug: string }[] }>(gql`
      {
        posts {
          slug
        }
      }
    `);

    return data.posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error('Error fetching static params:', error);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { post } = await client.request<{ post: Post }>(GET_POST_BY_SLUG, {
      slug: params.slug,
    });

    if (!post) return { title: 'Post Not Found' };

    return {
      title: `${post.title} | NewsKorna`,
      description: `Read "${post.title}" published on ${new Date(
        post.publishedAt
      ).toLocaleDateString()}`,
      openGraph: {
        title: post.title,
        description: `Read "${post.title}" on NewsKorna`,
        publishedTime: post.publishedAt,
        // Add other OpenGraph properties as needed
      },
    };
  } catch (error) {
    console.error('Metadata generation error:', error);
    return { title: 'Error loading post' };
  }
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = params;

  let postData;
  try {
    postData = await client.request<{ post: Post }>(GET_POST_BY_SLUG, { slug });
  } catch (err) {
    console.error('Error fetching post by slug:', err);
    return notFound();
  }

  const post = postData?.post;

  if (!post) return notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {post.coverPhoto?.url && (
        <div className="relative w-full h-[300px] md:h-[400px] mb-6">
          <Image
            src={post.coverPhoto.url}
            alt={post.title}
            fill
            className="object-cover rounded-lg"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
          />
        </div>
      )}

      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <p className="text-sm text-gray-500 mb-6">
            Published on {new Date(post.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </header>

        <div
          className="prose prose-lg max-w-none text-gray-800 dark:text-gray-200"
          dangerouslySetInnerHTML={{ __html: post.content.html }}
        />
      </article>
    </div>
  );
}

export const revalidate = 60;