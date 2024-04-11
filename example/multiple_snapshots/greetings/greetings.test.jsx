import renderer from "react-test-renderer";
import { it, expect } from "vitest";
import Greetings from "./greetings";

it("renders correctly", () => {
  const tree = renderer.create(<Greetings name="World" />).toJSON();
  expect(tree).toMatchSnapshot();
});
