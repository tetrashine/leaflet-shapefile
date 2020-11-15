import node from "rollup-plugin-node-resolve";

export default {
  input: "index",
  plugins: [node()],
  output: {
    file: "dist/shp.js",
    format: "umd",
    name: "shapefile"
  }
};