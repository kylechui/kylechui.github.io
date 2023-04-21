import Link from 'next/link';

export default function Custom404() {
  return (
    <center>
      <h1>404 - Page Not Found</h1>
      <p>
        Couldn't find the page you were looking for? Try{' '}
        <Link href=".">navigating home</Link>.
      </p>
    </center>
  );
}
