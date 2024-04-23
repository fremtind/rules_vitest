import renderer from "react-test-renderer";
const { it, expect } = await import("vitest");
import Link from "./link";

it("renders correctly", () => {
  const tree = renderer
    .create(<Link page="https://aspect.build">Aspect</Link>)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
