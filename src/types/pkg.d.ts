type IMetadata = {
  packages: {
    [packageName: string]: {
      [packageVersion: string]: {
        dependencies: Record<string, string>,
        dependants: string[]
      }
    }
  }
}

type IPackageJSON = {
  name: string;
  version: string;
  description?: string;
  main?: string;
  types?: string;
  typings?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  bundledDependencies?: string[];
  engines?: {
    node?: string;
    npm?: string;
    yarn?: string;
    [key: string]: string | undefined;
  };
  os?: string[];
  cpu?: string[];
  private?: boolean;
  workspaces?: string[] | { packages?: string[]; nohoist?: string[] };
  repository?: {
    type: "git" | "svn";
    url: string;
    directory?: string;
  };
  keywords?: string[];
  author?:
    | string
    | {
        name: string;
        email?: string;
        url?: string;
      };
  license?: string;
  bugs?: {
    url?: string;
    email?: string;
  };
  homepage?: string;
  funding?:
    | Array<{
        type: "github" | "patreon" | "open_collective" | string;
        url: string;
      }>
    | {
        type: "github" | "patreon" | "open_collective" | string;
        url: string;
      };
  files?: string[];
  bin?: string | Record<string, string>;
  man?: string | string[];
  directories?: {
    lib?: string;
    bin?: string;
    man?: string;
    doc?: string;
    example?: string;
    test?: string;
  };
  config?: Record<string, unknown>;
  publishConfig?: {
    access?: "public" | "restricted";
    registry?: string;
    tag?: string;
    [key: string]: unknown;
  };
  exports?:
    | string
    | Record<
        string,
        | string
        | {
            require?: string;
            import?: string;
            types?: string;
            default?: string;
            [key: string]: string | undefined;
          }
      >;
  imports?: Record<string, any>;
  type?: "module" | "commonjs";
  sideEffects?: boolean | string[];
  [key: string]: unknown;
};
