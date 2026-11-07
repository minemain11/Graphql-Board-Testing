// apollo-upload-client v20은 타입 선언(.d.ts)을 제공하지 않아서 필요한 부분만 직접 선언합니다.
declare module "apollo-upload-client/UploadHttpLink.mjs" {
  import { ApolloLink } from "@apollo/client";

  interface UploadHttpLinkOptions {
    uri?: string;
    headers?: Record<string, string>;
    credentials?: RequestCredentials;
    fetchOptions?: RequestInit;
  }

  export default class UploadHttpLink extends ApolloLink {
    constructor(options?: UploadHttpLinkOptions);
  }
}
