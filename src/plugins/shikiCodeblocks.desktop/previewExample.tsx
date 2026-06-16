/* eslint-disable simple-header/header */
import type { FC } from "react";

const handleClick = async () =>
    console.log((await import("@utils/misc")).copyToClipboard("\u200b"));

export const Example: FC<{
    real: boolean,
    zapped?: number,
}> = ({ real, zapped }) => <>
    <p>{`Zap${real ? `pe${zapped ? "d" : ""}` : "y"}`}</p>
    <button onClick={handleClick}>Click Me</button>
</>;
