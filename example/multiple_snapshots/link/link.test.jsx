import renderer from "react-test-renderer";
import { it, expect } from "vitest";
import Link from "./link";

it("renders correctly", () => {
  const tree = renderer
    .create(<Link page="https://aspect.build">Aspect</Link>)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
