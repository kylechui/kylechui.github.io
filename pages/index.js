import Date from "../components/date";
import Head from "next/head";
import Layout, { siteTitle } from "../components/layout";
import Link from "next/link";
import utilStyles from "../styles/utils.module.css";
import { getSortedPostsData } from "../lib/posts";

export async function getStaticProps() {
  const allPostsData = getSortedPostsData();
  return {
    props: {
      allPostsData,
    },
  };
}

export default function Home({ allPostsData }) {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <div>
          Hi, I'm <b>Kyle</b>, a third year CS major at UCLA. Welcome to my
          blog, where I post my half-baked ideas on whatever I'm interested in
          at the moment. Currently, that's:
          <ul>
            <li>
              Software correctness (Functional programming, type systems, formal
              methods)
            </li>
            <li>Software tooling (Neovim, NixOS)</li>
          </ul>
        </div>
        <p>
          I'm always open to chat and meet new people; feel free to see what I'm
          up to on{" "}
          <Link href="https://www.linkedin.com/in/kylechui">LinkedIn</Link> or{" "}
          <Link href="https://www.github.com/kylechui">Github</Link>, or reach
          out to me <Link href="mailto:kyle.chui@pm.me">via e-mail</Link>.
        </p>
      </section>
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Blog</h2>
        <ul className={utilStyles.list}>
          {allPostsData.map(({ id, date, title }) => (
            <li className={utilStyles.listItem} key={id}>
              <Link href={`/posts/${id}`}>{title}</Link>
              <br />
              <small className={utilStyles.lightText}>
                <Date dateString={date} />
              </small>
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  );
}
