import antfu from "@antfu/eslint-config";

export default antfu({
  react: true,
  rules: {
    "unicorn/prefer-node-protocol": "off",
    "node/prefer-global/process": "off",
  },
});
