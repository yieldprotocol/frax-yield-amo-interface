import Document, { Html, Head, Main, NextScript } from 'next/document';
import tw from 'tailwind-styled-components';

const Body = tw.body`bg-gray-50 dark:bg-gray-800`;

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link href="https://cdnjs.cloudflare.com/ajax/libs/inter-ui/3.19.3/inter.css" rel="stylesheet" />
        </Head>
        <Body>
          <Main />
          <NextScript />
        </Body>
      </Html>
    );
  }
}

export default MyDocument;
