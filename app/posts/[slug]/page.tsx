import { GraphQLClient, gql } from 'graphql-request';
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

type PageProps = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = params;

  try {
    const { post } = await client.request(GET_POST_BY_SLUG, { slug });

    if (!post) return { title: 'Post Not Found' };

    return {
      title: `${post.title} | NewsKorna`,
      description: `Read "${post.title}" published on ${new Date(post.publishedAt).toLocaleDateString()}`,
    };
  } catch (error) {
    console.error('Error generating metadata:', error.message);
    return { title: 'Error' };
  }
}

export async function generateStaticParams() {
  try {
    const data = await client.request(gql`
      {
        posts {
          slug
        }
      }
    `);

    return data.posts.map((post: { slug: string }) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error('Error fetching static params:', error.message);
    return [];
  }
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = params;

  let postData;
  try {
    postData = await client.request(GET_POST_BY_SLUG, { slug });
  } catch (err) {
    console.error('Error fetching post by slug:', err.message);
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
          />
        </div>
      )}

      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
      <p className="text-sm text-gray-500 mb-6">
        Published on {new Date(post.publishedAt).toLocaleDateString()}
      </p>
      <div
        className="prose prose-lg max-w-none text-gray-800"
        dangerouslySetInnerHTML={{ __html: post.content?.html || '' }}
      />
    </div>
  );
}

export const revalidate = 60;