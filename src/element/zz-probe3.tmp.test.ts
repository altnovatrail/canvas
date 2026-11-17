import { expect, test } from "vitest";
import { commands, userEvent } from "vitest/browser";
import "./index.js";
import { settle } from "./pointer.fixture.js";

test("probe", async () => {
  const element = document.createElement("novatrail-canvas");
  element.style.width = "400px";
  element.style.height = "300px";
  document.body.append(element);
  await settle();
  const root = element.shadowRoot;
  const out: string[] = [];
  const tools = root?.querySelector(".tools") as HTMLElement;
  const rail = root?.querySelector(".rail") as HTMLElement;
  out.push(`tools ${JSON.stringify(tools.getBoundingClientRect())} sh ${tools.scrollHeight} ch ${tools.clientHeight}`);
  out.push(`rail ${JSON.stringify(rail.getBoundingClientRect())}`);
  out.push(`el ${JSON.stringify(element.getBoundingClientRect())}`);
  for (const b of root?.querySelectorAll(".tools button") ?? []) {
    out.push(`${b.textContent} hidden=${(b as HTMLElement).hidden} ${b.outerHTML.replace(/<svg.*<\/svg>/, "")} ${JSON.stringify(b.getBoundingClientRect())}`);
  }
  const s = getComputedStyle(tools);
  out.push(`bg ${s.backgroundColor} color ${s.color} bf ${s.backdropFilter}`);
  const pen = root?.querySelectorAll(".tools button")[2] as HTMLElement;
  out.push(`pen bg ${getComputedStyle(pen).backgroundColor} color ${getComputedStyle(pen).color}`);
  for (let i = 0; i < 4; i++) {
    await userEvent.tab();
    const a = root?.activeElement ?? document.activeElement;
    out.push(`tab ${i}: ${a?.tagName} ${a?.className} ${a?.textContent?.slice(0, 20)}`);
  }
  await commands.writeFile(`zz-probe3-${navigator.userAgent.includes("Firefox") ? "ff" : navigator.userAgent.includes("Chrome") ? "cr" : "wk"}.tmp.txt`, out.join("\n"));
  element.remove();
  expect(1).toBe(1);
});
