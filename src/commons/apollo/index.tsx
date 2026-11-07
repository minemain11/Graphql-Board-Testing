"use client";

import { ApolloClient, InMemoryCache, type Reference } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import UploadHttpLink from "apollo-upload-client/UploadHttpLink.mjs";
import type { ReactNode } from "react";

import { BOARDS_PER_PAGE } from "@/commons/libraries/constants";

function makeClient() {
  return new ApolloClient({
    // 파일(이미지)이 포함된 요청은 multipart로, 나머지는 일반 JSON으로 보내주는 링크
    // 같은 프로젝트 안의 GraphQL 서버(src/app/api/graphql)로 요청합니다.
    link: new UploadHttpLink({ uri: "/api/graphql" }),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            // 캐시에 이미 있는 게시글(방금 등록·수정한 글)은 상세 페이지에서 바로 보여줍니다.
            fetchBoard: {
              read(_, { args, toReference }) {
                return toReference({ __typename: "Board", _id: args?.boardId });
              },
            },
            fetchBoards: {
              // page는 캐시 key에서 제외 → 1, 2, 3페이지 결과를 하나의 목록으로 이어 붙입니다. (무한 스크롤)
              keyArgs: ["search", "startDate", "endDate"],
              merge(
                existing: readonly Reference[] = [],
                incoming: readonly Reference[],
                { args }
              ) {
                const page = (args?.page as number | undefined) ?? 1;
                // 1페이지를 다시 받아오면(등록·삭제 후 refetch) 목록을 처음부터 새로 시작
                if (page === 1) return incoming;
                return [
                  ...existing.slice(0, (page - 1) * BOARDS_PER_PAGE),
                  ...incoming,
                ];
              },
              // 페이지를 넘기는 사이 새 글이 올라오면 같은 글이 두 번 올 수 있어서 중복을 걸러줍니다.
              read(existing: readonly Reference[] | undefined, { readField }) {
                if (!existing) return undefined;
                const seen = new Set<string>();
                return existing.filter((ref) => {
                  const id = readField<string>("_id", ref);
                  if (!id || seen.has(id)) return false;
                  seen.add(id);
                  return true;
                });
              },
            },
          },
        },
      },
    }),
  });
}

// 브라우저에서는 클라이언트를 하나만 만들어서 계속 재사용합니다.
// (서버 렌더링 중에는 요청마다 새로 만들어 다른 사용자와 캐시가 섞이지 않게 합니다.)
let browserClient: ApolloClient | undefined;

function getClient() {
  if (typeof window === "undefined") return makeClient();
  browserClient ??= makeClient();
  return browserClient;
}

export default function ApolloSetting({ children }: { children: ReactNode }) {
  return <ApolloProvider client={getClient()}>{children}</ApolloProvider>;
}
