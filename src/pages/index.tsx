/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Link from 'next/link';

import { GetStaticProps } from 'next';
import { useState } from 'react';
import { FaCalendar, FaUser } from 'react-icons/fa';
import Header from '../components/Header';

import { getPrismicClient } from '../services/prismic';

import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const postsGetStatics = postsPagination.results.map(post => {
    return {
      ...post,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
    };
  });

  const [posts, setPosts] = useState(postsGetStatics);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  const handleNextPage = async (): Promise<void> => {
    // realizamos um fetch da proxima pagina
    const postsResults = await fetch(`${nextPage}`).then(response =>
      response.json()
    );
    // caso tenhamos uma proxima pagina atualizamos a nextPage
    setNextPage(postsResults.next_page);
    // setamos os novos posts formatando a data novamente
    setPosts([
      ...posts,
      ...postsResults.results.map(post => {
        return {
          ...post,
          first_publication_date: format(
            new Date(post.first_publication_date),
            'dd MMM yyyy',
            {
              locale: ptBR,
            }
          ),
        };
      }),
    ]);
  };

  return (
    <>
      <Header />

      <main className={styles.homeContainer}>
        <ul>
          {posts.map((post: Post) => {
            return (
              <li key={post.uid}>
                <Link href={`/post/${post.uid}`}>
                  <div className={styles.homePreviewPosts}>
                    <h1>{post.data.title}</h1>
                    <span>{post.data.subtitle}</span>

                    <div className={styles.homeFooterPreviewPosts}>
                      <div>
                        <FaCalendar />
                        <span>{post.first_publication_date}</span>
                      </div>

                      <div>
                        <FaUser />
                        <span>{post.data.author}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        {nextPage && (
          <a className={styles.homeLoadMorePosts} onClick={handleNextPage}>
            Carregar mais posts
          </a>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postResponse = await prismic.getByType('posts', { pageSize: 2 });

  const posts = postResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      // first_publication_date: format(
      //   new Date(post.last_publication_date),
      //   'dd LLLL yyyy',
      //   {
      //     locale: ptBR,
      //   }
      // ),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  // o next_page pega a proxima página
  const postsPagination = {
    next_page: postResponse.next_page,
    results: posts,
  };

  return {
    props: { postsPagination },
    revalidate: 1800,
  };
};
