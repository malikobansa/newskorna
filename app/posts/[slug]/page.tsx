// app/posts/[slug]/page.tsx
import { GraphQLClient, gql } from 'graphql-request';
import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';

const client = new GraphQLClient(process.env.NEXT_PUBLIC_HYGRAPH_ENDPOINT || '');

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

// Option 1: Use Next.js's built-in types
type Props = {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

// Option 2: Or if you prefer your own interface
interface PageProps {
  params: { slug: string };
}

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

export async function generateStaticParams() {
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
}

export async function generateMetadata(
  { params }: { params: { slug: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    const { post } = await client.request<{ post: Post }>(GET_POST_BY_SLUG, {
      slug: params.slug,
    });

    if (!post) {
      return {
        title: 'Post Not Found',
      };
    }

    const previousImages = (await parent).openGraph?.images || [];

    return {
      title: `${post.title} | NewsKorna`,
      description: `Read "${post.title}" published on ${new Date(
        post.publishedAt
      ).toLocaleDateString()}`,
      openGraph: {
        title: post.title,
        description: `Read "${post.title}" on NewsKorna`,
        publishedTime: post.publishedAt,
        images: post.coverPhoto?.url
          ? [post.coverPhoto.url, ...previousImages]
          : previousImages,
      },
    };
  } catch (error) {
    return {
      title: 'Error loading post',
    };
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  try {
    const { post } = await client.request<{ post: Post }>(GET_POST_BY_SLUG, {
      slug: params.slug,
    });

    if (!post) {
      return notFound();
    }

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
  } catch (error) {
    return notFound();
  }
}

export const revalidate = 60;