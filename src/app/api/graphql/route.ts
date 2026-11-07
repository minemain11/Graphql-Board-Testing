import { createYoga } from "graphql-yoga";

import { schema } from "@/server/schema";

// 화면(Apollo Client)이 요청을 보내는 GraphQL 서버 주소: /api/graphql
const yoga = createYoga({
  schema,
  graphqlEndpoint: "/api/graphql",
  // 개발할 때만 브라우저에서 /api/graphql 로 API를 직접 실행해 볼 수 있는 화면(GraphiQL)을 켭니다.
  graphiql: process.env.NODE_ENV !== "production",
  // 요청마다 남는 기록은 끄고, 경고·에러만 남깁니다.
  logging: "warn",
  fetchAPI: { Response },
});

export async function GET(request: Request) {
  return yoga.handleRequest(request, {});
}

export async function POST(request: Request) {
  return yoga.handleRequest(request, {});
}
