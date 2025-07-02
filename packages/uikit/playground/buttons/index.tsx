import { Reset } from "@blueprintjs/icons";
import { Button } from "@/Button";

export const ButtonsExample = () => {
  return (
    <div className="col-group">
      <div className="row-group">
        <Button size="lg">Button</Button>
        <Button icon={<Reset />} size="md">
          Button
        </Button>
        <Button size="md">Button</Button>
        <Button size="md" isLoading>
          Button
        </Button>
        <Button size="sm">Button</Button>
      </div>
      <div className="row-group">
        <Button size="lg" accent="danger">
          Button
        </Button>
        <Button icon={<Reset />} size="md" accent="danger">
          Button
        </Button>
        <Button size="md" accent="danger">
          Button
        </Button>
        <Button size="md" accent="danger" isLoading>
          Button
        </Button>
        <Button size="sm" accent="danger">
          Button
        </Button>
      </div>
      <div className="row-group">
        <Button size="lg" accent="success">
          Button
        </Button>
        <Button icon={<Reset />} size="md" accent="success">
          Button
        </Button>
        <Button size="md" accent="success">
          Button
        </Button>
        <Button size="md" accent="success" isLoading>
          Button
        </Button>
        <Button size="sm" accent="success">
          Button
        </Button>
      </div>
    </div>
  );
};
