import "./globals.css"
import "tailwindcss/tailwind.css"
import React from "react"
import ReactDOM from "react-dom/client"
import { Editor } from "./Editor/index"
import { useEditorState } from "./Editor/state/use-editor-state"
import { useEffect } from "react"

const root = document.getElementById("root")
if (!root) {
  throw new Error("Root element not found")
}

function App() {
  const { addAnimations } = useEditorState()
  useEffect(() => {
    addAnimations({
      fadeIn: {
        currentTime: 0,
        elements: {
          header: [
            {
              elementId: "header",
              animationName: "fadeIn",
              valueName: "opacity",
              keyframes: [0, 1],
              options: {
                duration: 1,
                easing: "ease-in-out",
              },
              source: "motion-one",
            },
          ],
          content: [
            {
              elementId: "content",
              animationName: "fadeIn",
              valueName: "transform",
              keyframes: [20, 0],
              options: {
                duration: 2,
                easing: [0.25, 0.1, 0.25, 1],
              },
              source: "motion-one",
            },
          ],
        },
      },
    })
    console.log("added animations")
  }, [])

  return <Editor user={{ isPro: true }} />
}

ReactDOM.createRoot(root).render(<App />)
