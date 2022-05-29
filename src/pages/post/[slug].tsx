/* eslint-disable react/no-danger */
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { FaCalendar, FaClock, FaUser } from 'react-icons/fa';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  return (
    <>
      <Header />

      <div className={styles.imgDiv}>
        <img
          className={styles.imgPost}
          src={post.data.banner.url}
          alt={post.data.title}
        />
      </div>

      <main className={styles.postContainer}>
        <h1>{post.data.title}</h1>

        <div className={styles.postSubTitleIcons}>
          <div>
            <FaCalendar />
            <span>{post.first_publication_date}</span>
          </div>

          <div>
            <FaUser />
            <span>{post.data.author}</span>
          </div>

          <div>
            <FaClock />
            <span>4 min</span>
          </div>
        </div>

        {post.data.content.map(content => {
          return (
            <article key={content.heading} className={styles.postArticle}>
              <h1>{content.heading}</h1>
              <main
                className={styles.postContent}
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(content.body),
                }}
              />
            </article>
          );
        })}
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts');

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({});
  const { slug } = params;
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: format(
      new Date(response.first_publication_date),
      'dd LLLL yyyy',
      { locale: ptBR }
    ),
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        };
      }),
    },
  };

  // console.log para debugar
  // console.log(JSON.stringify(post, null, 2));

  return {
    props: {
      post,
    },
    revalidate: 1800,
  };
};
