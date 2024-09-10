import * as React from "react"
import styled from "styled-components"
import { InspectIcon } from "../icons/InspectIcon"

function inspect(motionId: string) {
  
}

interface Props {
  name: string
}

const Container = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: var(--row-height);

  h2 code {
    font-size: 12px;
    font-weight: bold;
    line-height: 1.4;
  }
`

export function ElementDetails({ name }: Props) {
  return (
    <Container>
      <h2>
        <code>{name}</code>
      </h2>
      <button onClick={() => inspect(name)}>
        <InspectIcon
          style={{ opacity: 0.5, width: 13, height: 13, fill: "var(--white)" }}
        />
      </button>
    </Container>
  )
}
