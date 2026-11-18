import { CAST } from "./layout";

const ORDER = ["site", "general", "x", "trading"] as const;

function src(id: string, part: "body" | "top" | "shadow", theme?: "light" | "dark") {
  if (part === "shadow") return `/studio/cast/${id}-shadow.webp`;
  return `/studio/cast/${id}-${part}-${theme}.webp`;
}

/** Painted characters lifted from the concept art. Parts stay separate so a later motion pass can move them. */
export default function Cast() {
  return (
    <>
      {ORDER.map((id) => {
        const part = CAST[id];
        return (
          <g key={id} className="mascot" data-mascot={id}>
            <image
              data-part="shadow"
              href={src(id, "shadow")}
              x={part.shadow.x}
              y={part.shadow.y}
              width={part.shadow.w}
              height={part.shadow.h}
            />
            <image
              className="cast-light"
              data-part="body"
              href={src(id, "body", "light")}
              x={part.body.x}
              y={part.body.y}
              width={part.body.w}
              height={part.body.h}
            />
            <image
              className="cast-dark"
              data-part="body"
              href={src(id, "body", "dark")}
              x={part.body.x}
              y={part.body.y}
              width={part.body.w}
              height={part.body.h}
            />
            {part.top && (
              <>
                <image
                  className="cast-light"
                  data-part="top"
                  href={src(id, "top", "light")}
                  x={part.top.x}
                  y={part.top.y}
                  width={part.top.w}
                  height={part.top.h}
                />
                <image
                  className="cast-dark"
                  data-part="top"
                  href={src(id, "top", "dark")}
                  x={part.top.x}
                  y={part.top.y}
                  width={part.top.w}
                  height={part.top.h}
                />
              </>
            )}
          </g>
        );
      })}
    </>
  );
}
