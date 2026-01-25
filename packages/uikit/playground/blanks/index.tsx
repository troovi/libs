import { Blank } from '@/Blank'
import { faCircleExclamation, faMagnifyingGlass, faRectangleHistory } from '@companix/icons-solid'

export const BlanksExample = () => {
  return (
    <div className="row-group" style={{ gap: '16px' }}>
      <Container>
        <Blank icon={faMagnifyingGlass} title="No search results" />
      </Container>
      <Container>
        <Blank
          icon={faRectangleHistory}
          title="No search results"
          description="Your search didnt match any files."
        />
      </Container>
      <Container>
        <Blank
          icon={faCircleExclamation}
          title="No search results"
          appearance="negative"
          description="Your search didnt match any files."
        />
      </Container>
    </div>
  )
}

const Container = ({ children }: { children: React.ReactNode }) => {
  return <div className="center w-full blank-example rounded-lg">{children}</div>
}
