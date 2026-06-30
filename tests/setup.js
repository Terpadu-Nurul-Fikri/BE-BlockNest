import { vi } from "vitest";

export const prismaMock = vi.hoisted(() => ({
  $transaction: vi.fn(),
  product: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  productImage: {
    deleteMany: vi.fn(),
    createMany: vi.fn(),
  },
  category: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  banner: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  order: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
    delete: vi.fn(),
  },
  payment: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  review: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  user: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
}));
globalThis.__prismaMock = prismaMock;

const resetPrismaMock = () => {
  for (const model of Object.values(prismaMock)) {
    if (typeof model === "function") {
      model.mockReset();
      continue;
    }

    for (const method of Object.values(model)) {
      method.mockReset();
    }
  }

  prismaMock.$transaction.mockImplementation((callback) => callback(prismaMock));
};

vi.mock("../src/config/index.js", () => ({
  prisma: prismaMock,
  connectDB: vi.fn(),
  disconnectDB: vi.fn(),
}));

export const jwtVerifyMock = vi.hoisted(() => vi.fn());
globalThis.__jwtVerifyMock = jwtVerifyMock;

vi.mock("jsonwebtoken", () => ({
  default: {
    verify: jwtVerifyMock,
  },
}));

beforeEach(() => {
  resetPrismaMock();
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  process.env.JWT_SECRET = "test-secret";
  delete process.env.PAYMENT_WEBHOOK_SECRET;
});
