import axios from "axios";
import { GetStaticPaths, GetStaticProps } from "next";
import { Prism } from "react-syntax-highlighter";
import React, { useCallback, useEffect, useState } from "react";
import { API_URL } from "../../components/constants";
import StandardLayout from "../../components/StandardLayout";
import { serialize } from "../../components/serverSide";
import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import matter from "gray-matter";
import {
  getCodeContent,
  getSingleCodeContent,
  idToTitle,
  useCopyCode,
} from "../../components/hooks";
import {
  Body,
  Breadcrumbs,
  Button,
  ExternalLink,
  H1,
  H2,
  H3,
  H4,
  IconButton,
  Subtitle,
  ThankYou,
  ThankYouSponsor,
  isThankYouEmoji,
  CardGrid,
} from "@dvargas92495/ui";
import SponsorDialog from "../../components/SponsorDialog";
import RoamJSDigest from "../../components/RoamJSDigest";
import MdxComponents from "../../components/MdxComponents";
import fs from "fs";
import { isSafari } from "react-device-detect";
import DemoVideo from "../../components/DemoVideo";
import Loom from "../../components/Loom";

const rowLength = 4;

const ExtensionPage = ({
  content,
  id,
  description,
  development,
  sponsors,
  entry,
  //@deprecated
  loom,
  skipDemo,
  legacy,
}: {
  id: string;
  content: MDXRemoteSerializeResult;
  description: string;
  development: boolean;
  entry: string;
  sponsors?: ThankYouSponsor[];
  //@deprecated
  loom: string;
  skipDemo: boolean; // only in video extension
  legacy: boolean;
}): React.ReactElement => {
  const [randomItems, setRandomItems] = useState([]);
  const total = randomItems.length;
  const title = idToTitle(id);
  const [copied, setCopied] = useState(false);
  const onSave = useCopyCode(setCopied);
  const [pagination, setPagination] = useState(0);
  const onClickLeft = useCallback(
    () => setPagination((pagination - rowLength + total) % total),
    [pagination, setPagination]
  );
  const onClickRight = useCallback(
    () => setPagination((pagination + rowLength + total) % total),
    [pagination, setPagination]
  );
  useEffect(() => {
    axios.get(`${API_URL}/request-path`).then((r) => {
      const items = r.data.paths
        .filter((p) => p.state !== "PRIVATE" && p.id !== id)
        .map((p) => ({
          image: `/thumbnails/${p.id}.png`,
          title: idToTitle(p.id),
          description: p.description,
          href: `/extensions/${p.id}`,
        }))
        .map((item) => ({ item, r: Math.random() }))
        .sort(({ r: a }, { r: b }) => a - b)
        .map(({ item }) => item);
      setRandomItems(items);
    });
  }, [setRandomItems, id]);
  return (
    <StandardLayout
      title={title}
      description={description}
      img={`https://roamjs.com/thumbnails/${id}.png`}
    >
      <Breadcrumbs
        page={title.toUpperCase()}
        links={[
          {
            text: "EXTENSIONS",
            href: "/extensions",
          },
        ]}
      />
      {development && <H2>UNDER DEVELOPMENT</H2>}
      <H1>{title.toUpperCase()}</H1>
      <Subtitle>{description}</Subtitle>
      <H3>Installation</H3>
      {!isSafari && (
        <>
          <Body>
            You could use the Copy Extension button below to individually
            install this extension. To install, just paste anywhere in your Roam
            graph and click "Yes, I Know What I'm Doing".
          </Body>
          <div style={{ marginBottom: 24 }}>
            <Button
              onClick={() => onSave(`${id}/main`, entry)}
              color="primary"
              variant="contained"
            >
              COPY EXTENSION
            </Button>
            {copied && <span style={{ marginLeft: 24 }}>COPIED!</span>}
          </div>
          <H4>Manual Installation</H4>
          <Body>
            If the extension doesn't work after using the copy extension button
            above, try installing manually using the instructions below.
          </Body>
        </>
      )}
      <Body>
        First create a <b>block</b> with the text{" "}
        <code>{"{{[[roam/js]]}}"}</code> on any page in your Roam DB. Then,
        create a single child of this block type three back ticks. A code block
        should appear. Copy this code and paste it into the child code block in
        your graph:
      </Body>
      <div style={{ marginBottom: 48 }}>
        <Prism language="javascript">
          {entry
            ? getCodeContent(id, entry)
            : getSingleCodeContent(`${id}/main`)}
        </Prism>
      </div>
      <Body>Finally, click "Yes, I Know What I'm Doing".</Body>
      {content.compiledSource ? (
        <MDXRemote {...content} components={MdxComponents} />
      ) : (
        "No content"
      )}
      {legacy && (!development || loom) && !skipDemo && (
        <>
          <H3>Demo</H3>
          {loom ? <Loom id={loom} /> : <DemoVideo src={id} />}
        </>
      )}
      <H3>Contributors</H3>
      <Body>
        This extension is brought to you by RoamJS! If you are facing any issues
        reach out to{" "}
        <ExternalLink href={"mailto:support@roamjs.com"}>
          support@roamjs.com
        </ExternalLink>{" "}
        or click on the chat button on the bottom right. If you get value from
        using this extension, consider sponsoring RoamJS by clicking on the
        button below!
      </Body>
      <SponsorDialog id={id} />
      {!!sponsors?.length && (
        <>
          <Body>
            A special thanks to those who's contributions also helped make this
            extension possible:
          </Body>
          <ThankYou
            sponsors={sponsors}
            defaultImgSrc={"/sponsors/default.jpg"}
          />
        </>
      )}
      <div style={{ margin: "128px 0" }}>
        <div style={{ width: "100%", textAlign: "center" }}>
          <RoamJSDigest />
        </div>
      </div>
      <H3>Other Extensions</H3>
      <div
        style={{
          margin: "16px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <IconButton
          icon={"chevronLeft"}
          onClick={onClickLeft}
          style={{ height: 48 }}
        />
        <CardGrid
          items={[
            ...randomItems.slice(pagination, pagination + rowLength),
            ...(pagination + rowLength > total
              ? randomItems.slice(0, pagination + rowLength - total)
              : []),
          ]}
          width={3}
        />
        <IconButton
          icon={"chevronRight"}
          onClick={onClickRight}
          style={{ height: 48 }}
        />
      </div>
    </StandardLayout>
  );
};

export const getStaticPaths: GetStaticPaths = async () =>
  axios
    .get(`${API_URL}/request-path`)
    .then((r) => ({
      paths: r.data.paths.map(({ id }) => ({
        params: {
          id,
        },
      })),
      fallback: false,
    }))
    .catch(() => ({
      paths: [],
      fallback: false,
    }));

export const getStaticProps: GetStaticProps<
  {
    content: MDXRemoteSerializeResult;
    id: string;
    development: boolean;
  },
  {
    id: string;
    subpath: string;
  }
> = ({ params: { id } }) =>
  axios
    .get(`${API_URL}/request-path?id=${id}`)
    .then(({ data: { content, ...rest } }) => {
      const mdxContent =
        content === "FILE"
          ? fs
              .readFileSync(`pages/docs/extensions/${id}.mdx`)
              .toString()
              .replace(/(.)---\s/s, "$1---\n\n### Usage\n")
          : content;
      return { ...matter(mdxContent), ...rest };
    })
    .then(({ content: preRender, data, state, description }) => {
      const { contributors: contributorsJson } = JSON.parse(
        fs.readFileSync("./thankyou.json").toString()
      );
      return serialize(preRender).then((content) => ({
        props: {
          content,
          id,
          development: state === "DEVELOPMENT",
          legacy: state === "LEGACY",
          description,
          sponsors: data.contributors
            ? data.contributors.split(",").map((s: string) => {
                const parts = s.trim().split(" ");
                const emojis = parts[parts.length - 1];
                const emojiKeys = emojis
                  .split("")
                  .map((s, i) => `${s}${emojis.charAt(i + 1)}`)
                  .filter((_, i) => i % 2 === 0)
                  .filter(isThankYouEmoji);
                const title = parts
                  .slice(0, emojiKeys.length ? parts.length - 1 : parts.length)
                  .join(" ");
                return {
                  ...contributorsJson[title],
                  title,
                  emojis: emojiKeys,
                };
              })
            : [],
          ...data,
        },
      }));
    })
    .catch((e) => {
      return serialize(
        `Failed to render due to: ${e.response?.data || e.message}`
      ).then((content) => ({
        props: {
          content,
          id,
          development: true,
        },
      }));
    });

export default ExtensionPage;
