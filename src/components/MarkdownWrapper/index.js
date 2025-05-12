import Avatar from "@material-ui/core/Avatar";
import Markdown from "markdown-to-jsx";
import React from "react";

const elements = [
  "a",
  "abbr",
  "address",
  "area",
  "article",
  "aside",
  "audio",
  "b",
  "base",
  "bdi",
  "bdo",
  "big",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "data",
  "datalist",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "div",
  "dl",
  "dt",
  "em",
  "embed",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hgroup",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "keygen",
  "label",
  "legend",
  "li",
  "link",
  "main",
  "map",
  "mark",
  "marquee",
  "menu",
  "menuitem",
  "meta",
  "meter",
  "nav",
  "noscript",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "param",
  "picture",
  "pre",
  "progress",
  "q",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "script",
  "section",
  "select",
  "small",
  "source",
  "span",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "title",
  "tr",
  "track",
  "u",
  "ul",
  "var",
  "video",
  "wbr",

  // SVG
  "circle",
  "clipPath",
  "defs",
  "ellipse",
  "foreignObject",
  "g",
  "image",
  "line",
  "linearGradient",
  "marker",
  "mask",
  "path",
  "pattern",
  "polygon",
  "polyline",
  "radialGradient",
  "rect",
  "stop",
  "svg",
  "text",
  "tspan",
];

const allowedElements = ["a", "b", "strong", "em", "u", "code", "del"];

const CustomLink = ({ children, ...props }) => (
  <a
    {...props}
    target="_blank"
    rel="noopener noreferrer"
    style={{ color: "#5D3FD3", textDecoration: "underline", fontWeight: 600 }}
  >
    {children}
  </a>
);

const MarkdownWrapper = ({ children, message }) => {
  let type = message?.mediaType;
  console.log("type", type);
  const boldRegex = /\*(.*?)\*/g;
  const tildaRegex = /~(.*?)~/g;

  if (children && boldRegex.test(children)) {
    children = children.replace(boldRegex, "**$1**");
  }
  if (children && tildaRegex.test(children)) {
    children = children.replace(tildaRegex, "~~$1~~");
  }

  const options = React.useMemo(() => {
    const markdownOptions = {
      disableParsingRawHTML: true,
      forceInline: true,
      overrides: {
        a: { component: CustomLink },
        strong: {
          props: {
            style: { color: "#5D3FD3", fontWeight: 700 },
          },
        },
        em: {
          props: {
            style: { color: "#5D3FD3", fontStyle: "italic" },
          },
        },
      },
    };

    elements.forEach((element) => {
      if (!allowedElements.includes(element)) {
        markdownOptions.overrides[element] = (el) => el.children || null;
      }
    });

    return markdownOptions;
  }, []);

  if (!children) return null;
  const regex = /(?<=FN:)(.*)(?=\n)|(?<=TEL;.*:)(.*)(?=\n)/g;

  // Executar a expressão regular na string do vCard
  const matches = children.match(regex);

  // Extrair o nome e o número de telefone
  const contact = matches ? matches[0] : "";
  const number = matches ? matches[1] : "";
  const vcardStyle = {
    backgroundColor: "#f7f7fa",
    border: "2px solid #5D3FD3",
    borderRadius: "12px",
    width: "320px",
    display: "flex",
    alignItems: "center",
    padding: "12px 0",
    boxShadow: "0 2px 12px rgba(93,63,211,0.10)",
    margin: "8px 0",
  };

  const avatar = {
    marginLeft: "16px",
    width: 56,
    height: 56,
    border: "2px solid #5D3FD3",
  };

  const infoStyle = {
    marginLeft: "18px",
  };
  const p = {
    margin: "4px",
    fontSize: 16,
    color: "#222",
  };

  if (type === "contactMessage") {
    return (
      <div style={vcardStyle}>
        <Avatar
          style={avatar}
          src={message.contact.profilePicUrl}
          alt="contact_image"
        />
        <div style={infoStyle}>
          <p style={p}>
            <strong style={{ color: "#5D3FD3" }}>Nome:</strong> {contact}
          </p>
          <p style={p}>
            <strong style={{ color: "#5D3FD3" }}>Número:</strong> {number}
          </p>
        </div>
      </div>
    );
  }
  return (
    <div
      style={{ fontSize: 16, color: "#444", lineHeight: 1.6, margin: "4px 0" }}
    >
      <Markdown options={options}>{children}</Markdown>
    </div>
  );
};

export default MarkdownWrapper;
