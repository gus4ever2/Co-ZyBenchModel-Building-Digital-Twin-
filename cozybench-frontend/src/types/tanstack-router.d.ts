import "@tanstack/router-core";

declare module "@tanstack/router-core" {
  interface StaticDataRouteOption {
    workspaceHeader?: {
      eyebrow: string;
      title: string;
      backTo?: string;
    };
  }
}
