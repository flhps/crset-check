export default {
  preset: "ts-jest",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
    "^.+\\.json$": ["ts-jest", { useESM: true }],
  },
  testMatch: ["**/src/__tests__/**/*.[jt]s?(x)"],
  resolver: "ts-jest-resolver",
};
