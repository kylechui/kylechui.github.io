import Date from "../components/date";
import Head from "next/head";
import Image from "next/image";
import Layout, { siteTitle } from "../components/layout";
import Link from "next/link";
import utilStyles from "../styles/utils.module.css";
import { getSortedPostsData } from "../lib/posts";
import { GetStaticProps } from "next";

export const getStaticProps: GetStaticProps = async () => {
  const allPostsData = getSortedPostsData();
  return {
    props: {
      allPostsData,
    },
  };
};

export default function Home({
  allPostsData,
}: {
  allPostsData: {
    date: string;
    title: string;
    id: string;
  }[];
}) {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <div>
          Hi, I'm <b>Kyle</b>, a senior at UCLA studying Computer Science.
          Welcome to my blog, where I post my half-baked ideas on whatever I'm
          interested in at the moment. Currently, that's:
          <ul>
            <li>
              Software correctness (Functional programming, type systems, build
              systems)
            </li>
            <li>Software tooling (Neovim, NixOS)</li>
          </ul>
        </div>
        <p>
          I'm always open to chat and meet new people; feel free to see what I'm
          up to on{" "}
          <Link href="https://www.linkedin.com/in/kylechui">LinkedIn</Link> or{" "}
          <Link href="https://www.github.com/kylechui">Github</Link>, or e-mail
          me at{" "}
          <Image
            priority
            src="/images/email.png"
            height={32}
            width={192}
            alt=""
            style={{
              display: "inline-block",
              verticalAlign: "-9px",
            }}
          />
          .
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
