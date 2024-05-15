import React from "react";
import { it, expect } from "vitest";
import renderer from "react-test-renderer";
import Link from "./link";

it("renders correctly", () => {
  const tree = renderer
    .create(<Link page="https://aspect.build">Aspect</Link>)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
