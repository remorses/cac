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
              id: "header",
              keyframes: {
                "a0": {
                  id: "a0",
                  value: "0",
                  offset: 0,
                },
                "a1": {
                  id: "a1",
                  value: "1",
                  offset: 1,
                },
              },
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
              id: "content",
              keyframes: {
                "0": {
                  id: "0",
                  value: "20",
                  offset: 0,
                },
                "1": {
                  id: "1",
                  value: "0",
                  offset: 1,
                },
              },
              options: {
                duration: 1,

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
