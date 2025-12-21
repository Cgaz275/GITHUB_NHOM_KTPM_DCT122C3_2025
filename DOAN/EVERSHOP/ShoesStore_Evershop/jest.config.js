export default {
  testEnvironment: "node",
  preset: 'ts-jest/presets/default-esm',
  coverageProvider: 'v8',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        isolatedModules: true
      }
    }]
  },
  moduleNameMapper: {
    '^@evershop/postgres-query-builder$': '<rootDir>/packages/postgres-query-builder/src/index.ts',
    '^@evershop/postgres-query-builder/(.*)$': '<rootDir>/packages/postgres-query-builder/src/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(@evershop)/)"
  ],
  testMatch: [
    "<rootDir>/packages/**/src/**/__tests__/**/*.test.[jt]s",
    "<rootDir>/packages/**/src/**/*.test.[jt]s"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/packages/evershop/dist",
    "services/login",
    "services/logout",
    "services/session"
  ],
  testPathPattern: process.env.TEST_MODULE
    ? `packages/evershop/src/modules/${process.env.TEST_MODULE}/tests`
    : undefined,
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  collectCoverageFrom: process.env.TEST_MODULE
    ? [
        `packages/evershop/src/modules/${process.env.TEST_MODULE}/**/*.{ts,tsx,js}`,
        `!packages/evershop/src/modules/${process.env.TEST_MODULE}/**/*.test.{ts,tsx,js}`,
        `!packages/evershop/src/modules/${process.env.TEST_MODULE}/tests/**`,
        `!packages/evershop/src/modules/${process.env.TEST_MODULE}/pages/**`,
        `!packages/evershop/src/modules/${process.env.TEST_MODULE}/graphql/**`,
        `!packages/evershop/src/modules/${process.env.TEST_MODULE}/migration/**`,
        `!packages/evershop/src/modules/${process.env.TEST_MODULE}/api/**`,
        "!packages/evershop/dist/**"
      ]
    : [
        "packages/evershop/src/modules/**/*.{ts,tsx,js}",
        "!packages/evershop/src/modules/**/tests/**",
        "!packages/evershop/src/modules/**/*.test.{ts,tsx,js}",
        "!packages/evershop/dist/**"
      ],
  coverageDirectory: "<rootDir>/coverage",
  coverageReporters: ["text", "text-summary", "html", "lcov", "json"],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "packages/evershop/dist",
    "services/login",
    "services/logout",
    "services/session"
  ]
};
