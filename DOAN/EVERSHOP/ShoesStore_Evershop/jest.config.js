export default {
  testEnvironment: "node",
  collectCoverage: false,
  moduleNameMapper: {
    '^@evershop/postgres-query-builder$': '<rootDir>/packages/postgres-query-builder/dist/index.js',
    '^@evershop/postgres-query-builder/(.*)$': '<rootDir>/packages/postgres-query-builder/dist/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(@evershop)/)"
  ],
  testMatch: ["**/dist/**/tests/**/*.test.[jt]s"],
  testPathIgnorePatterns: [
    "/node_modules/",
    "services/login",
    "services/logout",
    "services/session"
  ],
  modulePathIgnorePatterns: ["<rootDir>/packages/evershop/src/"]
};
