import type { Route } from "./+types/home";
import { EditorPage } from "../pages/EditorPage/EditorPage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <>
      <EditorPage />
      <div id="tooltip" />
      <div id="modal" />
    </>
  );
}
