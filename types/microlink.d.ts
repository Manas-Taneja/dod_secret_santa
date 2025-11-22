declare module "@microlink/react" {
  import { ComponentType } from "react";

  interface MicrolinkProps {
    url: string;
    size?: "small" | "normal" | "large";
    style?: React.CSSProperties;
    [key: string]: any;
  }

  const Microlink: ComponentType<MicrolinkProps>;
  export default Microlink;
}

