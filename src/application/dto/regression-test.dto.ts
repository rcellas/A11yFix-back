export interface GenerateRegressionTestInput {
  findingId: string;
}

export interface RegressionTestOutput {
  findingId: string;
  framework: string;
  testName: string;
  code: string;
}
