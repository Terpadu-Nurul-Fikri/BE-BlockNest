import { vi } from "vitest";

const buildPrismaMock = () => ({
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
});

export const prismaMock = globalThis.__prismaMock ?? buildPrismaMock();
globalThis.__prismaMock = prismaMock;
export const jwtVerifyMock = globalThis.__jwtVerifyMock;

export const resetPrismaMock = () => {
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

export const createMockRes = () => {
  const res = {
    statusCode: 200,
    body: undefined,
    redirectedTo: undefined,
    status: vi.fn((code) => {
      res.statusCode = code;
      return res;
    }),
    json: vi.fn((payload) => {
      res.body = payload;
      return res;
    }),
    redirect: vi.fn((target) => {
      res.redirectedTo = target;
      return res;
    }),
  };

  return res;
};
